import motor.motor_asyncio
import os

def init_database():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.environ["MONGODB_URL"])
    database = client.get_database()
    collection = database.get_collection()
    return collection