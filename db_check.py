import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["aquashop"]
    
    print("--- USERS ---")
    async for user in db["users"].find():
        print(f"ID: {user['_id']}, Name: {user.get('first_name')} {user.get('last_name')}, Email: {user.get('email')}, Phone: {user.get('phone')}")
        
    print("\n--- PRODUCTS ---")
    async for prod in db["products"].find():
        print(f"ID: {prod['_id']}, Name: {prod.get('name')}, Price: {prod.get('price')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
