from fastapi import FastAPI, status, Body
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from models import *
from database import *
from token_authentication import TokenAuthenticator
from token_threads import check_time_thread
import asyncio
import time
import threading
import uuid
import uvicorn
import os


app = FastAPI()


origins = [
    # "https://frontend-ngnhr6tt3a-ul.a.run.app/"
    "http://localhost:3000"
]


# creating TokenAuthenticator objects

tokens = TokenAuthenticator()

login_tokens = TokenAuthenticator()


# create and start threads for checking token timeout

token_thread = threading.Thread(target=asyncio.run, args=(check_time_thread(tokens),), daemon=True)

login_thread = threading.Thread(target=asyncio.run,args=(check_time_thread(login_tokens),), daemon=True)

token_thread.start()
login_thread.start()


# routing functions

@app.post(path="/login/", status_code=status.HTTP_200_OK)
async def login(hash: HashSchema = Body(...)):
    """
    This is the 1st of 2 user login routes
    It receives a master hash from the frontend and checks to see if that hash is in the user database
    If it is, a token and a time are issued for the hash and place in the login_tokens set
    This function returns LoginResponseSchema or LoginErrorSchema
    """
    master_hash = jsonable_encoder(hash)
    hash = master_hash["hash"]
    result = await auth_user(hash)
    if result == "success":
        token = str(uuid.uuid4())
        token_dict = {
            "token": token,
            "time" : time.time()
        }
        token_add = await login_tokens.add_token(hash, token_dict)
        if token_add == "success":
            return LoginResponseSchema(token)
        else:
            return LoginErrorSchema("Login Failed")
    else:
        return LoginErrorSchema("Login Failed")
    

@app.post(path="/mfa-login/", status_code=status.HTTP_200_OK)
async def mfa_login(mfa: MFASchema = Body(...)):
    """
    This is the 2nd multi-factor authentication route for user login
    It receives a master hash, an MFA code, and a session token from the frontend
    It first verifies that the hash and MFA code are correct
    It then verifies if the token is correct for the given hash
    If it is, the hash and token dict are moved from the login_tokens set to the tokens_set
    The login_tokens hash is then removed
    This function returns MFAResponseSchema or MFAErrorSchema
    """
    mfa_json = jsonable_encoder(mfa)
    hash = mfa_json["hash"]
    code = mfa_json["code"]
    token = mfa_json["token"]
    result = await mfa_verify(hash, code)
    if result == "success":
        token_ver = await login_tokens.verify_token(hash, token)
        if token_ver == "failure":
            return MFAErrorSchema("Invalid token")
        if token_ver == "success":
           token_switch = await switch_tokens(hash)
           if token_switch == "failure":
                return MFAErrorSchema("Failed to Verify") 
           if token_switch == "success":
                update_time = await tokens.update_time(hash)
                if update_time == "failure":
                    return "failure"
                return MFAResponseSchema()
    else:
        return MFAErrorSchema("MFA code is incorrect")
    

@app.post(path="/get-vault/", status_code=status.HTTP_200_OK)
async def get_vault(get_data: TokenSchema = Body(...)):
    """
    This is the vault retrieval route
    It receives a master hash, and a session token from the frontend
    It first verifies that the hash and token are valid
    If they are, the hash is used to retrieve the user's encrypted vault
    The vault is then returned to the frontend
    This function returns GetVaultResponseSchema or GetVaultErrorSchema
    This function updates the user's token time on sucess
    """
    get_json = jsonable_encoder(get_data)
    hash = get_json["hash"]
    token = get_json["token"]
    token_ver = await tokens.verify_token(hash, token)
    if token_ver != "success":
        return GetVaultErrorSchema("Invalid token")
    if token_ver == "success":
        result = await auth_user(hash)
        if result == "success":
            update_time = await tokens.update_time(hash)
            if update_time == "failure":
                return "failure"
            vault = await find_vault(hash)
            if vault == "failure":
                GetVaultErrorSchema("Get Vault Failed")
            return GetVaultResponseSchema(vault)
        if result != "success":
            return GetVaultErrorSchema("Find User Failed")


@app.post(path="/account-create/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserSchema = Body(...)):
    """
    This is the 1st of 2 account creation routes
    It receives an email, master hash, mfa token, and vault from the frontend
    It first verifies that the user's email has not been used before
    If it hasn't, a user entry is created on the user database with the above entries
    A new mfa URL is created by the backend and returned to the frontend
    This function returns CreateResponseSchema or CreateErrorSchema
    """
    new_user = jsonable_encoder(user)
    result = await add_user(new_user)
    if result == "failure":
        return CreateErrorSchema("Account Creation Failed")
    mfa_result = await mfa_user(new_user["email"])
    if mfa_result == "failure":
        return CreateErrorSchema("Account Creation Failed")
    else:
        return CreateResponseSchema(mfa_result)
    

@app.post(path="/auth-create/", status_code=status.HTTP_200_OK)
async def auth_create(mfa_schema: MFACreateSchema = Body(...)):
    """
    This is the 2nd multi-factor authentication route for account creation
    It receives a master hash an MFA code from the frontend
    It verifies that the hash and code are correct
    If they are, then a success message is sent back to the frontend
    This function returns CreateFAResponseSchema or CreateFAErrorSchema
    """
    mfa_json = jsonable_encoder(mfa_schema)
    result = await mfa_verify(mfa_json["hash"], mfa_json["code"])
    if result == "success":
        return CreateFAResponseSchema()
    else:
        return CreateFAErrorSchema("Account Verification Failed")   


@app.post(path="/account-update/", status_code=status.HTTP_200_OK)
async def user_update(user_data: UserUpdate = Body (...)):
    """
    This is the account update route
    It receives an email, a master hash, and a session token from the frontend
    It verifies that the user exists by checking the given email
    It retrieves the user's old hash using the given email
    It then verifies that the session token is valid
    It then replaces the old hash with the new master hash if they are not identical
    If the update is successful, a success message is sent back to the frontend
    This function returns UpdateResponseSchema or UpdateErrorSchema
    This function updates the user's token time on sucess
    """
    user_json = jsonable_encoder(user_data)
    email = user_json["email"]
    new_hash = user_json["hash"]
    user = await find_user_by_email(email)
    if user == "failure":
        return UpdateErrorSchema("Invalid token")
    old_hash = user["hash"]
    token = user_json["token"]
    token_ver = await tokens.verify_token(old_hash, token)
    if token_ver != "success":
        return UpdateErrorSchema("Invalid token")
    if new_hash != old_hash:
        token_dict = await tokens.get_token_dict(old_hash)
        if token_dict == "failure":
            return UpdateErrorSchema("Invalid token")
        else:
            token_add = await tokens.add_token(new_hash, token_dict)
            if token_add == "failure":
                return UpdateErrorSchema("Invalid token")
            else:
                token_rem = await tokens.remove_token(old_hash)
                if token_rem == "failure":
                    return UpdateErrorSchema("Invalid token")
    if token_ver == "success":
        update_time = await tokens.update_time(new_hash)
        if update_time == "failure":
            return "failure"
        result = await update_user(user_json)
        if result != "success":
            return UpdateErrorSchema("Failure")
        if result == "success":
            return UpdateResponseSchema()


@app.post(path="/vault-update/", status_code=status.HTTP_200_OK)
async def vault_update(vault_data: VaultSchema = Body (...)):
    """
    This is the vault update route
    It receives a master hash, a new vault, and a session token from the frontend
    It then verifies that the session token is valid
    It then updates the user's vault in the user database
    If the update is successful, a success message is sent back to the frontend
    This function returns VaultResponseSchema or VaultErrorSchema
    This function updates the user's token time on sucess
    """
    vault_json = jsonable_encoder(vault_data)
    hash = vault_json["hash"]
    vault = vault_json["vault"]
    token = vault_json["token"]
    token_ver = await tokens.verify_token(hash, token)
    if token_ver != "success":
        return VaultErrorSchema("Invalid token")
    if token_ver == "success":
        update_time = await tokens.update_time(hash)
        if update_time == "failure":
            return "failure"
        result = await update_vault(hash, vault)
        if result == "failure to update vault":
            return VaultErrorSchema("Failure to Update Vault")
        if result == "failure to find user":
            return VaultErrorSchema("Failure")
        elif result == "success":
            return VaultResponseSchema()


@app.post(path="/account-delete/", status_code=status.HTTP_200_OK)
async def user_delete(delete_data: TokenSchema = Body(...)):
    """
    This is the account delete route
    It receives a master hash and a session token from the frontend
    It then verifies that the session token is valid
    It then deletes the user associated with the given master hash from the user database
    If the deletion is successful, a success message is sent back to the frontend
    This function returns DeleteResponseSchema or DeleteErrorSchema
    """
    delete_json = jsonable_encoder(delete_data)
    hash = delete_json["hash"]
    token = delete_json["token"]
    token_ver = await tokens.verify_token(hash, token)
    if token_ver != "success":
        return DeleteErrorSchema("Invalid token")
    if token_ver == "success":
        result = await delete_user(hash)
        if result == "failure to find user":
            return DeleteErrorSchema("Failure to Find User")
        if result == "failure to delete user":
            return DeleteErrorSchema("Failure to Delete User")
        elif result == "success":
            return DeleteResponseSchema()


@app.post(path="/logout/", status_code=status.HTTP_200_OK)
async def logout(logout_data: TokenSchema = Body(...)):
    """
    This is the logout route
    It receives a master hash and a session token from the frontend
    It then verifies that the session token is valid
    It then logs the user out by removing the given hash from the tokens set
    If the logout is successful, a success message is sent back to the frontend
    This function returns LogoutResponseSchema or LogoutErrorSchema
    """
    logout_json = jsonable_encoder(logout_data)
    hash = logout_json["hash"]
    token = logout_json["token"]
    token_ver = await tokens.verify_token(hash, token)
    if token_ver != "success":
        token_remove = await tokens.remove_token(hash)
        if token_remove != "success":
            return LogoutErrorSchema("Invalid token")
        else:
            return LogoutErrorSchema("Invalid token")
    result = await auth_user(hash)
    if result == "success":
        token_rem = await tokens.remove_token(hash)
        if token_rem == "failure":
            return LogoutErrorSchema("Logout Failed")
        else:
            return LogoutResponseSchema()
    else:
        return LogoutErrorSchema("Logout Failed")
    

# token functions

async def switch_tokens(hash: str):
    """
    This is the token switching function
    It takes a master hash and retrieves the token and time from the login_tokens set
    It copies the hash, token, and time to the tokens set
    It then removes them from the login_tokens set
    This function returns the strings "failure" or "success"
    """
    token_dict = await login_tokens.get_token_dict(hash)
    if token_dict == "failure":
        return "failure"
    else:
        add_token = await tokens.add_token(hash, token_dict)
        if add_token == "failure":
            return "failure"
        if add_token == "success":
            remove_token = await login_tokens.remove_token(hash)
            if remove_token == "failure":
                return "failure"
            if remove_token == "success":
                return "success"


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))