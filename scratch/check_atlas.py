import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

async def check_db():
    uri = "mongodb+srv://24ucs046_db_user:hE9ANtbBWCb0LU7c@aquashop.ps73mgm.mongodb.net/?appName=Aquashop"
    print(f"Connecting to MongoDB Atlas...")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        # Ping the server
        await client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful!")
        
        db = client["aquashop"]
        print("\n--- Collections list ---")
        collections = await db.list_collection_names()
        print(collections)
        
        print("\n--- User Count ---")
        count = await db["users"].count_documents({})
        print(f"Number of users: {count}")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(check_db())
