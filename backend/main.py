# ═══════════════════════════════════════
# main.py — AquaShop FastAPI Entry Point
# ═══════════════════════════════════════

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(base_dir, ".env"))

# ── IMPORT ROUTERS ──
from routes.auth     import router as auth_router
from routes.products import router as products_router
from routes.contact  import router as contact_router
from routes.cart     import router as cart_router
from routes.wishlist import router as wishlist_router
from routes.orders   import router as orders_router
from routes.checkout import router as checkout_router
# from routes.user     import router as user_router

# ── APP ──
app = FastAPI(
    title       = "AquaShop API",
    description = "Backend for AquaShop E-Commerce",
    version     = "1.0.0",
)

# ── CORS ──
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5500").rstrip("/")
app.add_middleware(
    CORSMiddleware,
    allow_origins     = [
        frontend_url,
        "https://aquashop-nine.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── ROUTERS ──
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(contact_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(orders_router)
app.include_router(checkout_router)
# app.include_router(user_router)

# ── HEALTH CHECK ──
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "AquaShop API is running 🚀"}

# ── DATABASE AUTO-SEEDING ──
from config import users_col
from utils.auth import hash_password
from datetime import datetime

async def seed_default_users():
    try:
        # Seed Admin user if missing
        admin_exists = await users_col.find_one({"email": "24ucs046@gmail.com"})
        if not admin_exists:
            admin_doc = {
                "first_name": "Admin",
                "last_name": "User",
                "email": "24ucs046@gmail.com",
                "phone": "123-456-7890",
                "password": hash_password("admin123"), # default password
                "avatar": "https://ui-avatars.com/api/?name=Admin+User&background=00BFCF&color=fff",
                "is_google": False,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await users_col.insert_one(admin_doc)
            print("🌱 Seeded default Admin user (24ucs046@gmail.com) into MongoDB!")

    except Exception as e:
        print(f"⚠️ Error seeding default users: {str(e)}")

@app.on_event("startup")
async def startup_event():
    await seed_default_users()