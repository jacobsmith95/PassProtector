from fastapi import FastAPI, status, Body
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from models import UserSchema, UserUpdate, HashSchema, TokenSchema, EmailSchema, VaultSchema, MFASchema, DeleteSchema, LoginResponseSchema, GetVaultResponseSchema, CreateResponseSchema, CreateFAResponseSchema, MFAResponseSchema, UpdateResponseSchema, VaultResponseSchema, DeleteResponseSchema, LogoutResponseSchema, LoginErrorSchema, GetVaultErrorSchema, CreateErrorSchema, CreateFAErrorSchema, MFAErrorSchema, UpdateErrorSchema, VaultErrorSchema, DeleteErrorSchema, LogoutErrorSchema
from database import add_user, mfa_user, find_user_by_email, auth_user, mfa_verify, find_vault, update_user, update_vault, delete_user
from token_authentication import TokenAuthenticator
import time
import uuid
import uvicorn
import os


app = FastAPI()


tokens = TokenAuthenticator()


login_tokens = TokenAuthenticator()


origins = [
    # "https://frontend-ngnhr6tt3a-ul.a.run.app/"
    "http://localhost:3000"
]


@app.post(path="/login/", status_code=status.HTTP_200_OK)
async def login(hash: HashSchema = Body(...)):
    """
    
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
        token_add = await login_token_addition(hash, token_dict)
        if token_add == "success":
            return LoginResponseSchema(token)
        else:
            return LoginErrorSchema("Login Failed")
    else:
        return LoginErrorSchema("Login Failed")
    

@app.post(path="/mfa-login/", status_code=status.HTTP_200_OK)
async def mfa_login(mfa: MFASchema = Body(...)):
    """
    
    """
    mfa_json = jsonable_encoder(mfa)
    hash = mfa_json["hash"]
    code = mfa_json["code"]
    token = mfa_json["token"]
    result = await mfa_verify(hash, code)
    if result == "success":
        token_ver = await login_token_verification(hash, token)
        if token_ver == "failure":
           return MFAErrorSchema("Failed to Verify")
        if token_ver == "success":
           token_switch = await switch_tokens(hash)
           if token_switch == "failure":
               return MFAErrorSchema("Failed to Verify") 
           if token_switch == "success":
               return MFAResponseSchema()
    else:
        return MFAErrorSchema("Failed to Verify")
    

@app.post(path="/get-vault/", status_code=status.HTTP_200_OK)
async def get_vault(get_data: TokenSchema = Body(...)):
    """
    
    """
    get_json = jsonable_encoder(get_data)
    hash = get_json["hash"]
    token = get_json["token"]
    token_ver = await token_verification(hash, token)
    if token_ver != "success":
        return GetVaultErrorSchema("Invalid token")
    if token_ver == "success":
        result = await auth_user(hash)
        if result == "success":
            vault = await find_vault(hash)
            if vault == "failure":
                GetVaultErrorSchema("Get Vault Failed")
            return GetVaultResponseSchema(vault)
        if result != "success":
            return GetVaultErrorSchema("Find User Failed")


@app.post(path="/account-create/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserSchema = Body(...)):
    """
    
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
async def auth_create(mfa_schema: MFASchema = Body(...)):
    """
    
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
    
    """
    user_json = jsonable_encoder(user_data)
    email = user_json["email"]
    new_hash = user_json["hash"]
    user = await find_user_by_email(email)
    if user == "failure":
        return UpdateErrorSchema("Invalid token")
    old_hash = user["hash"]
    token = user_json["token"]
    token_ver = await token_verification(old_hash, token)
    if token_ver != "success":
        return UpdateErrorSchema("Invalid token")
    if new_hash != old_hash:
        token_dict = await token_data(old_hash)
        if token_dict == "failure":
            return UpdateErrorSchema("Invalid token")
        else:
            token_add = await token_addition(new_hash, token_dict)
            if token_add == "failure":
                return UpdateErrorSchema("Invalid token")
            else:
                token_rem = await token_removal(old_hash)
                if token_rem == "failure":
                    return UpdateErrorSchema("Invalid token")
    if token_ver == "success":
        result = await update_user(user_json)
        if result != "success":
            return UpdateErrorSchema("Failure")
        if result == "success":
            return UpdateResponseSchema()


@app.post(path="/vault-update/", status_code=status.HTTP_200_OK)
async def vault_update(vault_data: VaultSchema = Body (...)):
    """
    
    """
    vault_json = jsonable_encoder(vault_data)
    hash = vault_json["hash"]
    vault = vault_json["vault"]
    token = vault_json["token"]
    token_ver = await token_verification(hash, token)
    if token_ver != "success":
        return VaultErrorSchema("Invalid token")
    if token_ver == "success":
        result = await update_vault(hash, vault)
        if result == "failure to update vault":
            return VaultErrorSchema("Failure to Update Vault")
        if result == "failure to find user":
            return VaultErrorSchema("Failure")
        elif result == "success":
            return VaultResponseSchema()


@app.post(path="/account-delete/", status_code=status.HTTP_200_OK)
async def user_delete(delete_data: DeleteSchema = Body(...)):
    """
    
    """
    delete_json = jsonable_encoder(delete_data)
    hash = delete_json["hash"]
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
    
    """
    logout_json = jsonable_encoder(logout_data)
    hash = logout_json["hash"]
    token = logout_json["token"]
    token_ver = await token_verification(hash, token)
    if token_ver != "success":
        token_remove = await token_removal(hash)
        if token_remove != "success":
            return LogoutErrorSchema("Invalid token")
        else:
            return LogoutErrorSchema("Invalid token")
    result = await auth_user(hash)
    if result == "success":
        token_rem = await token_removal(hash)
        if token_rem == "failure":
            return LogoutErrorSchema("Logout Failed")
        else:
            return LogoutResponseSchema()
    else:
        return LogoutErrorSchema("Logout Failed")
    

# token functions

async def token_addition(hash: str, token_dict: dict):
    """
    
    """
    result = await tokens.add_token(hash, token_dict)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def token_data(hash: str):
    """
    
    """
    result = await tokens.get_token_dict(hash)
    if result == "failure":
        return "failure"
    else:
        return result
    

async def token_verification(hash: str, token: str):
    """
    
    """
    result = await tokens.verify_token(hash, token)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def token_removal(hash: str):
    """
    
    """
    result = await tokens.remove_token(hash)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def login_token_addition(hash: str, token_dict: dict):
    """
    
    """
    result = await login_tokens.add_token(hash, token_dict)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def login_token_data(hash: str):
    """
    
    """
    result = await login_tokens.get_token_dict(hash)
    if result == "failure":
        return "failure"
    else:
        return result
    

async def login_token_verification(hash: str, token: str):
    """
    
    """
    result = await login_tokens.verify_token(hash, token)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def login_token_removal(hash: str):
    """
    
    """
    result = await login_tokens.remove_token(hash)
    if result != "success":
        return "failure"
    else:
        return "success"
    

async def switch_tokens(hash: str):
    """
    
    """
    token_dict = await login_token_data(hash)
    if token_dict == "failure":
        return "failure"
    else:
        add_token = await token_addition(hash, token_dict)
        if add_token == "failure":
            return "failure"
        if add_token == "success":
            remove_token = await login_token_removal(hash)
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