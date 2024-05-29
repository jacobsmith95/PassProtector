from backend_mfa import createAuthenticator, verify
import motor.motor_asyncio
import json


# MongoDB connection string goes here

db_details = "mongodb+srv://<username>:<password>@scmcluster.0yumvz4.mongodb.net/?retryWrites=true&w=majority&appName=SCMCluster"


# use async Motor to create a MongoDB client with the above credentials

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
    This function adds a new user to the database collection "Users"
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
    

async def mfa_user(email: str):
    """
    This function creates a new MFA authenticator url for a user, updates the user's "token" entry, and returns the url
    """
    user = await collection.find_one({"email": email})
    if user is None:
        return "failure"
    user_dict = user_helper(user)
    mfa_tuple = createAuthenticator(email)
    url = mfa_tuple[0]
    secret = mfa_tuple[1]
    result = await collection.update_one({"hash": user_dict["hash"]}, {"$set": {"token": secret}})
    if result.modified_count != 1:
        return "failure"
    return url


async def find_user(hash: str):
    """
    This function finds a user with the given hash, it returns the user dict
    """
    user = await collection.find_one({"hash": hash})
    if user is None:
        return "failure"
    else:
        return user_helper(user)
    
async def find_user_by_email(email: str):
    """
    This function finds a user with the given email, it returns the user dict
    """
    user = await collection.find_one({"email": email})
    if user is None:
        return "failure"
    else:
        return user_helper(user)


async def auth_user(hash: str):
    """
    This function checks to see if the given hash is in the "Users" database collection
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        return "success"
    return "failure"


async def mfa_verify(hash: str, mfa_code: str):
    """
    This function checks to see if the given hash and the given MFA code are valid
    """
    user = await collection.find_one({"hash": hash})
    if user is None:
        return "failure"
    user_dict = user_helper(user)
    secret = user_dict["token"]
    result = verify(secret, mfa_code)
    if result is True:
        return "success"
    else:
        return "failure"
    

async def find_vault(hash: str):
    """
    This function retrieves and returns the given hash's encrypted vault
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
    This function updates the given user's hash in the "Users" database collection
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
    This function updates the given user's vault in the "Users" database collection
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
    This function deletes the user associated with the given hash from the "Users" database collection
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        result = await collection.delete_one({"_id": user["_id"]})
        if result.deleted_count == 0:
            return "failure to delete user"
        if result.deleted_count == 1:
            return "success"
    return "failure to find user"


