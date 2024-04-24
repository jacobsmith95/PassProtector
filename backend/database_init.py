import motor.motor_asyncio

def init_database():
    client = motor.motor_asyncio.AsyncIOMotorClient("MONGODB_URL")
    return client