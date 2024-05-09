from fastapi import FastAPI, status, Body
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from models import UserSchema, UserUpdate, HashSchema, EmailSchema, VaultSchema, MFASchema, LoginResponseSchema, AuthResponseSchema, CreateResponseSchema, MFAResponseSchema, UpdateResponseSchema, VaultResponseSchema, DeleteResponseSchema, LoginErrorSchema, AuthErrorSchema, CreateErrorSchema, MFAErrorSchema, UpdateErrorSchema, VaultErrorSchema, DeleteErrorSchema
from database import add_user, mfa_user, token_addition, token_removal, token_verification, find_user, auth_user, mfa_verify, find_vault, update_user, update_vault, delete_user
import time
import uuid
import uvicorn
import os


app = FastAPI()


origins = [
    "https://frontend-ngnhr6tt3a-ul.a.run.app"
]



@app.post(path="/login/", status_code=status.HTTP_200_OK)
async def login(hash: HashSchema = Body(...)):
    """
    
    """
    master_hash = jsonable_encoder(hash)
    result = await auth_user(master_hash["hash"])
    if result == "success":
        token = uuid.uuid4()
        token_dict = {
            "token": token,
            "time" : time.time()
        }
        token_add = await token_addition(master_hash["hash"], token_dict)
        if token_add == "failure":
            return "failure"
        else:
            return LoginResponseSchema(token)
    else:
        return LoginErrorSchema("Login Failed")
    

@app.post(path="/get-vault/", status_code=status.HTTP_200_OK)
async def get_vault(hash: HashSchema = Body(...)):
    """
    
    """
    master_hash = jsonable_encoder(hash)
    result = await auth_user(master_hash["hash"])
    if result == "success":
        vault = await find_vault(master_hash["hash"])
        if vault == "failure":
            AuthErrorSchema("Get Vault Failed")
        return AuthResponseSchema(vault)
    else:
        return AuthErrorSchema("Find User Failed")


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
async def auth_user(mfa_schema: MFASchema = Body(...)):
    """
    
    """
    mfa_json = jsonable_encoder(mfa_schema)
    result = await mfa_verify(mfa_json["hash"], mfa_json["code"])
    if result == "success":
        return MFAResponseSchema()
    else:
        return MFAErrorSchema("Account Verification Failed")   


@app.post(path="/account-update/", status_code=status.HTTP_200_OK)
async def user_update(user_data: UserUpdate = Body (...)):
    """
    
    """
    user_json = jsonable_encoder(user_data)
    result = await update_user(user_json)
    if result == "failure":
        return UpdateErrorSchema("Failure")
    if result == "failure to find user":
        return UpdateErrorSchema("Failure to find User")
    if result == "failure to update":
        return UpdateErrorSchema("Failed to Update User")
    elif result == "success":
        return UpdateResponseSchema()


@app.post(path="/vault-update/", status_code=status.HTTP_200_OK)
async def vault_update(vault_data: VaultSchema = Body (...)):
    """
    
    """
    vault_json = jsonable_encoder(vault_data)
    hash = vault_json["hash"]
    vault = vault_json["vault"]
    result = await update_vault(hash, vault)
    if result == "failure to update vault":
        return VaultErrorSchema("Failure to Update Vault")
    if result == "failure to find user":
        return VaultErrorSchema("Failure")
    elif result == "success":
        return VaultResponseSchema()


@app.post(path="/account-delete/", status_code=status.HTTP_200_OK)
async def user_delete(hash: HashSchema = Body(...)):
    """
    
    """
    master_hash = jsonable_encoder(hash)
    result = await delete_user(master_hash["hash"])
    if result == "failure to find user":
        return DeleteErrorSchema("Failure to Find User")
    if result == "failure to delete user":
        return DeleteErrorSchema("Failure to Delete User")
    elif result == "success":
        return DeleteResponseSchema()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))