import motor.motor_asyncio

async def init_database():
    client = await motor.motor_asyncio.AsyncIOMotorClient("MONGODB_URL")
    return client