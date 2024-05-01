from fastapi import Depends, FastAPI, HTTPException, status, Response, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from backend.user_routes import router as UserRouter
from backend.models import User
import backend.database_init as dbi
import uvicorn
import os

app = FastAPI()

origins = [
    "https://frontend-ngnhr6tt3a-ul.a.run.app"
]

app.include_router(UserRouter, tags=["Users"], prefix="/authenticated")

client = dbi.init_database()

async def get_collection():
    db = await client["user_database"]
    collection = await db["Users"]
    return collection

@app.post(path="/login/{hash}/", response_description="got user", status_code=status.HTTP_200_OK, response_model=User)
async def login(hash: str, response: Response):
    """
    
    """
    collection = await get_collection()
    user = await collection.find_one({"hash": hash})
    if user is None:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    else:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response


@app.post(path="/create-account/", response_description="create a new user", status_code=status.HTTP_201_CREATED, response_model=User)
async def create_user(user: User = Body(...)):
    """
    Creates a new user in the Users collection and returns the created user's entry as defined by the User model
    """
    collection = await get_collection()
    new_user = jsonable_encoder(user)
    result = await collection.insert_one(new_user)
    created_user = await collection.find_one({"_id": result.inserted_id})
    if created_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"user not created")

    return created_user

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
    