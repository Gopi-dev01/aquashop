from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(base_dir, ".env"))

# ── ENV VARS ──
MONGO_URI                    = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB                     = os.getenv("MONGO_DB", "aquashop")
SECRET_KEY                   = os.getenv("SECRET_KEY", "changeme")
ALGORITHM                    = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES  = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))
GOOGLE_CLIENT_ID             = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET         = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI          = os.getenv("GOOGLE_REDIRECT_URI")
FRONTEND_URL                 = os.getenv("FRONTEND_URL", "http://localhost:5500").rstrip("/")

# ── MONGODB CLIENT ──
client = AsyncIOMotorClient(MONGO_URI)
db     = client[MONGO_DB]

# ── COLLECTIONS ──
users_col    = db["users"]
products_col = db["products"]
orders_col   = db["orders"]
cart_col     = db["cart"]
wishlist_col = db["wishlist"]
contact_col  = db["contact"]
reviews_col  = db["reviews"]