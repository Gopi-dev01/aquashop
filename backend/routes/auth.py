from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse
import httpx

from config import (
    users_col, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI, FRONTEND_URL
)
from schemas.user import RegisterSchema, LoginSchema
from models.user  import user_document, serialize_user
from utils.auth   import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# ══════════════════════════════
# REGISTER
# ══════════════════════════════
@router.post("/register", status_code=201)
async def register(payload: RegisterSchema):
    try:
        # Check duplicate email
        existing = await users_col.find_one({"email": payload.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Ensure password is a string and within bcrypt limits
        password_str = str(payload.password)
        if len(password_str.encode('utf-8')) > 72:
             raise HTTPException(status_code=400, detail="Password is too long (max 72 characters)")

        # Create user
        doc    = user_document(
            first_name      = payload.first_name,
            last_name       = payload.last_name,
            email           = payload.email,
            phone           = payload.phone,
            hashed_password = hash_password(password_str),
        )
        result = await users_col.insert_one(doc)
        doc["_id"] = result.inserted_id

        token = create_access_token({"sub": str(result.inserted_id)})

        return {
            "status":       "success",
            "message":      "Account created successfully",
            "access_token": token,
            "token_type":   "bearer",
            "user":         serialize_user(doc),
        }
    except Exception as e:
        # This will return the ACTUAL error message to your browser
        raise HTTPException(status_code=500, detail=f"Database/Server Error: {str(e)}")

# ══════════════════════════════
# LOGIN
# ══════════════════════════════
@router.post("/login")
async def login(payload: LoginSchema):
    user = await users_col.find_one({"email": payload.email.lower()})

    if not user or not verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user["_id"])})

    return {
        "message":      "Login successful",
        "access_token": token,
        "token_type":   "bearer",
        "user":         serialize_user(user),
    }

# ══════════════════════════════
# GOOGLE — Step 1: Redirect
# ══════════════════════════════
import urllib.parse

@router.get("/google")
async def google_login():
    params = {
        "client_id": GOOGLE_CLIENT_ID or "",
        "redirect_uri": GOOGLE_REDIRECT_URI or "",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

# ══════════════════════════════
# GOOGLE — Step 2: Callback
# ══════════════════════════════
@router.get("/google/callback")
async def google_callback(code: str):
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code":          code,
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri":  GOOGLE_REDIRECT_URI,
                "grant_type":    "authorization_code",
            }
        )
        token_data = token_res.json()

        if "access_token" not in token_data:
            error_detail = token_data.get("error_description") or token_data.get("error") or "Unknown error"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token exchange failed: {error_detail}"
            )

        # Get user info from Google
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"}
        )
        google_user = user_res.json()

    email = google_user.get("email", "").lower()

    # Find or create user
    user = await users_col.find_one({"email": email})

    if not user:
        doc = user_document(
            first_name      = google_user.get("given_name", ""),
            last_name       = google_user.get("family_name", ""),
            email           = email,
            phone           = "",
            hashed_password = "",
            is_google       = True,
            avatar          = google_user.get("picture"),
        )
        result = await users_col.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    token = create_access_token({"sub": str(user["_id"])})

    # Redirect to frontend with token
    return RedirectResponse(
        f"{FRONTEND_URL}/pages/home.html?token={token}"
    )

# ══════════════════════════════
# UPDATE USER DETAILS
# ══════════════════════════════
@router.put("/users/{email}")
async def update_user(email: str, payload: dict):
    user = await users_col.find_one({"email": email.lower().strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {}
    if "first_name" in payload:
        update_data["first_name"] = payload["first_name"]
    if "last_name" in payload:
        update_data["last_name"] = payload["last_name"]
    if "phone" in payload:
        update_data["phone"] = payload["phone"]
    if "avatar" in payload:
        update_data["avatar"] = payload["avatar"]
    if "email" in payload:
        new_email = payload["email"].lower().strip()
        if new_email != email.lower().strip():
            existing = await users_col.find_one({"email": new_email})
            if existing:
                raise HTTPException(status_code=400, detail="New email already registered")
            update_data["email"] = new_email

    if not update_data:
        return {"status": "success", "message": "No changes made", "user": serialize_user(user)}

    await users_col.update_one({"_id": user["_id"]}, {"$set": update_data})
    
    updated_user = await users_col.find_one({"_id": user["_id"]})
    return {
        "status": "success",
        "message": "User updated successfully",
        "user": serialize_user(updated_user)
    }

# ══════════════════════════════
# DELETE USER ACCOUNT
# ══════════════════════════════
@router.delete("/users/{email}")
async def delete_user(email: str):
    user = await users_col.find_one({"email": email.lower().strip()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await users_col.delete_one({"_id": user["_id"]})
    return {
        "status": "success",
        "message": "User deleted successfully"
    }

# ══════════════════════════════
# GET ALL USERS (FOR ADMIN)
# ══════════════════════════════
@router.get("/users")
async def get_all_users():
    users = []
    async for user in users_col.find():
        joined_date = "2026-05-01"
        if "created_at" in user and user["created_at"]:
            try:
                joined_date = user["created_at"].strftime("%Y-%m-%d")
            except Exception:
                pass
        
        users.append({
            "id":         str(user["_id"]),
            "first_name": user.get("first_name", ""),
            "last_name":  user.get("last_name", ""),
            "email":      user.get("email", ""),
            "phone":      user.get("phone") or "",
            "avatar":     user.get("avatar") or f"https://ui-avatars.com/api/?name={user.get('first_name','')}+{user.get('last_name','')}&background=00BFCF&color=fff",
            "role":       "Admin" if (user.get("email", "").lower().strip() in ["24ucs046@gmail.com", "24ucs046@gamil.com"]) else "Customer",
            "joined":     joined_date,
        })
    return users