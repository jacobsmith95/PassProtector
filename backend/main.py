from fastapi import Depends, FastAPI, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from user_routes import router as UserRouter
from models import User
import bcrypt
import database_init as dbi
import uvicorn
import os

app = FastAPI()

origins = [
    "https://frontend-ngnhr6tt3a-ul.a.run.app"
]

app.include_router(UserRouter, tags=["Users"], prefix="/authenticated")

client = dbi.init_database()
db = client["user_database"]
collection = db["Users"]

@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):

    collection = client.get_database()

    token = getToken(form_data.password, form_data.username)

    if token not in collection:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": token, "token_type": "bearer"}


def getToken(password, username):
    return bcrypt.hashpw(password, username)


@app.post("/create", response_description="create a new user", status_code=status.HTTP_201_CREATED, response_model=User)
async def create_user(user: User = Body(...)):
    """
    Creates a new user in the Users collection and returns the created user's entry as defined by the User model
    """
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

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
    