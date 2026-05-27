from datetime import datetime

def user_document(first_name, last_name, email, phone, hashed_password, is_google=False, avatar=None):
    """Build a new user document for MongoDB insertion."""
    return {
        "first_name":      first_name,
        "last_name":       last_name,
        "email":           email.lower().strip(),
        "phone":           phone,
        "password":        hashed_password,
        "avatar":          avatar,
        "is_google":       is_google,
        "is_active":       True,
        "created_at":      datetime.utcnow(),
        "updated_at":      datetime.utcnow(),
    }

def serialize_user(user: dict) -> dict:
    """Convert MongoDB user document to safe response dict."""
    return {
        "id":         str(user["_id"]),
        "first_name": user.get("first_name", ""),
        "last_name":  user.get("last_name", ""),
        "email":      user.get("email", ""),
        "phone":      user.get("phone"),
        "avatar":     user.get("avatar"),
        "is_google":  user.get("is_google", False),
    }