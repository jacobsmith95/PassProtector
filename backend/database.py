import motor.motor_asyncio
import json


db_details = "mongodb+srv://smithj24:8YwoKXyo8fsCaKU8@scmcluster.0yumvz4.mongodb.net/?retryWrites=true&w=majority&appName=SCMCluster"

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


#def create_helper(user) -> dict:
#    """
#    takes a user returned from the database and returns a dict object
#    """
#    dict = {
#    "id"    : str(user["_id"]),
#    "email" : user["email"],
#    "hash"  : user["hash"],
#    }
#
#    return dict


def update_helper(data) -> dict:
    """
    
    """
    dict = {
        "email": data["email"]
    }
    if data["hash"] != "None":
        dict["hash"] = data["hash"]
    if "token" in data:
        dict["token"] = data["token"]
    
    return dict




#Database CRUD Functions

async def add_user(user_data: dict):
    """
    
    """
    check = await collection.find_one({"email": user_data["email"]})
    if check is not None:
        return "failure"
    vault = user_data["vault"]
    del user_data["vault"]
    result = await collection.insert_one(user_data)
    new_user = await collection.find_one({"_id": result.inserted_id})
    if new_user is not None:
        vault_json = json.dumps(vault)
        vault_add = await collection.update_one({"hash": new_user["hash"]}, {"$set": {"vault": vault_json}})
        if vault_add.modified_count == 1:
            return "success"
        else:
            return "failure"
    else:
        return "failure"


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


async def update_user(new_data: dict):
    """
    
    """
    if len(new_data) < 2:
        return "failure"
    email = new_data["email"]
    user = await collection.find_one({"email": email})
    if user is not None:
        updated = await collection.update_one({"_id": user["_id"]}, {"$set": {"hash": new_data["hash"]}})
        if updated is None:
            return "failure to update"
        return "success"
    else:
        return "failure to find user"


async def update_vault(hash: str, new_vault: dict):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    vault = json.dumps(new_vault)
    if user is not None:
        updated = await collection.update_one({"_id": user["_id"]}, {"$set": {"vault": vault}})
        if updated is None:
            return "failure to update vault"
        return "success"
    else:
        return "failure to find user"


async def delete_user(hash: str):
    """
    
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        result = await collection.delete_one({"_id": user["_id"]})
        if result.deleted_count == 0:
            return "failure to delete user"
        if result.deleted_count == 1:
            return "success"
    return "failure to find user"


