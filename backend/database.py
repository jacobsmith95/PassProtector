import motor.motor_asyncio
import json


db_details = "mongodb+srv://<username>:<password>@scmcluster.0yumvz4.mongodb.net/?retryWrites=true&w=majority&appName=SCMCluster"

client = motor.motor_asyncio.AsyncIOMotorClient(db_details)
database = client["UserDatabase"]
collection = database["Users"]


#Helper Functions:

def user_helper(user) -> dict:
    """
    takes a user returned from the database and returns a dict object
    """
    dict = {
    "id"    : str(user["_id"]),
    "email" : user["email"],
    "hash"  : user["hash"],
    "token" : user["token"],
    "vault" : user["vault"]
    }

    return dict


#Database CRUD Functions

async def add_user(user_data: dict):
    """
    
    """
    result = await collection.insert_one(user_data)
    new_user = await collection.find_one({"_id": result.inserted_id})
    return user_helper(new_user)


async def find_user(hash: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is None:
        return "failure"
    else:
        return user_helper(user)


async def auth_user(hash: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        return "success"
    return "failure"
    

async def find_vault(hash: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is None:
        return "failure"
    else:
        user_dict = user_helper(user)
        vault = json.loads(user_dict["vault"])
        return vault


async def update_user(hash: str, new_data: dict):
    """
    
    """
    if len(new_data) < 1:
        return "failure"
    user = await collection.find_one({"hash": hash})
    if user is not None:
        updated = await collection.update_one({"_id": user["_id"]}, {"$set": new_data})
        if updated is None:
            return "failure to update"
        updated_user = await collection.find_one({"_id": updated.upserted_id})
        return user_helper(updated_user)
    else:
        return "failure"


async def update_vault(hash: str, new_vault: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        updated = await collection.update_one({"_id": user["_id"]}, {"$set": {"vault": new_vault}})
        if updated is None:
            return "failure to update vault"
        updated_user = await collection.find_one({"_id": updated.upserted_id})
        return user_helper(updated_user)
    else:
        return "failure"


async def delete_user(hash: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        result = await collection.delete_one({"_id": user["_id"]})
        if result is None:
            return "failure"
        return "success"
    else:
        return "failure"

