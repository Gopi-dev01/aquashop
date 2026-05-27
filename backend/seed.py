# ═══════════════════════════════════════
# seed.py — Seed MongoDB with Sample Products
# Run once: python seed.py
# ═══════════════════════════════════════

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB",  "aquashop")

def utcnow():
    return datetime.now(timezone.utc)

PRODUCTS = [
    {
        "name": "Premium Wireless Headphones with Noise Cancellation",
        "description": "Experience crystal-clear audio with industry-leading noise cancellation. 30-hour battery life.",
        "price": 149.99, "original_price": 199.99, "discount": 25,
        "category": "audio", "brand": "Sony",
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"],
        "stock": 50, "rating": 4.5, "reviews_count": 234,
        "is_featured": True, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Smart Watch Series 7 - Fitness & Health Tracker",
        "description": "Advanced health monitoring with ECG, blood oxygen sensor, GPS.",
        "price": 299.99, "original_price": 399.99, "discount": 25,
        "category": "wearables", "brand": "Apple",
        "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"],
        "stock": 30, "rating": 4.0, "reviews_count": 512,
        "is_featured": True, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "4K Ultra HD Monitor 27 Inch Professional Display",
        "description": "Stunning 4K resolution with 99% sRGB color accuracy. IPS panel.",
        "price": 449.99, "original_price": None, "discount": 0,
        "category": "electronics", "brand": "Dell",
        "images": ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"],
        "stock": 20, "rating": 4.5, "reviews_count": 189,
        "is_featured": True, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Smartphone Pro Max 256GB Latest Model",
        "description": "Most powerful smartphone with A17 chip, 48MP triple camera.",
        "price": 999.99, "original_price": 1199.99, "discount": 17,
        "category": "mobile", "brand": "Apple",
        "images": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"],
        "stock": 15, "rating": 4.0, "reviews_count": 823,
        "is_featured": True, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Bluetooth Speaker Portable Waterproof",
        "description": "360-degree sound, IPX7 waterproof, 12-hour battery life.",
        "price": 79.99, "original_price": None, "discount": 0,
        "category": "audio", "brand": "Bose",
        "images": ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80"],
        "stock": 60, "rating": 4.0, "reviews_count": 145,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Mechanical Gaming Keyboard RGB Backlit",
        "description": "Tactile mechanical switches, per-key RGB lighting, wireless.",
        "price": 129.99, "original_price": 159.99, "discount": 19,
        "category": "electronics", "brand": "LG",
        "images": ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80"],
        "stock": 40, "rating": 4.0, "reviews_count": 298,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Wireless Mouse Ergonomic Design",
        "description": "Ergonomic wireless mouse with precision tracking and long battery.",
        "price": 49.99, "original_price": None, "discount": 0,
        "category": "electronics", "brand": "LG",
        "images": ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80"],
        "stock": 80, "rating": 3.5, "reviews_count": 176,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "USB-C Hub Multiport Adapter",
        "description": "7-in-1 USB-C hub with HDMI, USB 3.0, SD card, and PD charging.",
        "price": 39.99, "original_price": None, "discount": 0,
        "category": "accessories", "brand": "Samsung",
        "images": ["https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&q=80"],
        "stock": 100, "rating": 4.0, "reviews_count": 89,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "True Wireless Earbuds ANC Pro",
        "description": "6-hour playtime, 24 hours from case, IPX4 water resistance.",
        "price": 79.99, "original_price": 99.99, "discount": 20,
        "category": "audio", "brand": "Sony",
        "images": ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80"],
        "stock": 60, "rating": 4.5, "reviews_count": 308,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Laptop Stand Adjustable Aluminium",
        "description": "Premium aluminium laptop stand, adjustable height, foldable.",
        "price": 34.99, "original_price": 44.99, "discount": 22,
        "category": "accessories", "brand": "Dell",
        "images": ["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80"],
        "stock": 90, "rating": 4.0, "reviews_count": 211,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Samsung Galaxy Tab S9 Ultra 14.6 inch",
        "description": "Massive AMOLED display, S Pen included, 12GB RAM, 256GB storage.",
        "price": 899.99, "original_price": 1099.99, "discount": 18,
        "category": "electronics", "brand": "Samsung",
        "images": ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&q=80"],
        "stock": 25, "rating": 4.5, "reviews_count": 542,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
    {
        "name": "Fitness Smart Band Activity Tracker",
        "description": "24/7 heart rate, sleep tracking, 14-day battery, IP68 waterproof.",
        "price": 59.99, "original_price": 79.99, "discount": 25,
        "category": "wearables", "brand": "Apple",
        "images": ["https://images.unsplash.com/photo-1575311373937-040b8e1fd6b0?w=600&q=80"],
        "stock": 70, "rating": 3.5, "reviews_count": 421,
        "is_featured": False, "is_active": True,
        "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc),
    },
]

async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db  = client[MONGO_DB]
    col = db["products"]

    try:
        existing = await col.count_documents({})
    except Exception as exc:
        print("❌ MongoDB connection failed:", exc)
        client.close()
        return

    if existing > 0:
        print(f"⚠️  Already has {existing} products. Drop the collection first to re-seed.")
        client.close()
        return

    result = await col.insert_many(PRODUCTS)
    print(f"✅ Seeded {len(result.inserted_ids)} products!")

    # Indexes for faster queries
    await col.create_index("category")
    await col.create_index("brand")
    await col.create_index("price")
    await col.create_index("rating")
    await col.create_index("is_featured")
    await col.create_index("is_active")
    print("✅ Indexes created!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())

    
    