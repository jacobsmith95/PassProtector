from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Annotated
import bcrypt
import database_init as dbi


app = FastAPI

templates = Jinja2Templates(directory="../ui/build")
app.mount('/static', StaticFiles(directory="../ui/build/static"), 'static')


@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):

    collection = dbi.init_database()

    token = getToken(form_data.password, form_data.username)

    if token not in collection:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": token, "token_type": "bearer"}


def getToken(password, username):
    return bcrypt.hashpw(password, username)