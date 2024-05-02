from fastapi import FastAPI, HTTPException, status, Response, Body
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from models import UserSchema, UserUpdate, HashSchema, LoginResponseSchema, LoginErrorSchema
from database import add_user, find_user, auth_user, find_vault, update_user, update_vault, delete_user
import uvicorn
import os

app = FastAPI()

origins = [
    "https://frontend-ngnhr6tt3a-ul.a.run.app"
]


@app.post(path="/login/", status_code=status.HTTP_200_OK)
async def login(hash: HashSchema):
    """
    
    """
    result = await auth_user(hash)
    if result == "success":
        vault = await find_vault(hash)
        return LoginResponseSchema(vault)
    


#@app.post(path="/account-create/", response_description="create a new user", status_code=status.HTTP_201_CREATED, response_model=User)
#async def create_user(user: User = Body(...)):
#    """
#    
#    """
    




app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

    