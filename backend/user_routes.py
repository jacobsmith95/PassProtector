from fastapi import APIRouter, Body, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
import database_init as dbi
from models import User, UserUpdate


router = APIRouter

client = dbi.init_database()
db = client["user_database"]
collection = db["Users"]

@router.post("/", response_description="create a new user", status_code=status.HTTP_201_CREATED, response_model=User)
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


#I am not sure we will need this route
@router.get("/{hash}/", response_description="got user", status_code=status.HTTP_200_OK, response_model=User)
async def get_user(hash: str):
    """
    Returns the Users entry for the given hash; 
    We use hash here because it will be unique for each user and each user account and we will have access to it, unlike the user ID
    """
    user = await collection.find_one({"hash": hash})
    if user is not None:
        return user
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{hash} not found")


@router.put("/update_{id}/", response_description="updated user", status_code=status.HTTP_200_OK, response_model=UserUpdate)
async def update_user(id: str, user_update: User = Body(...)):
    """
    Updates the information in the Users entry to what was sent in the request;
    Returns the new user entry
    """
    user = await collection.find_one({"_id": id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"id {id} not found")
    update_results = await collection.update_one({"_id": id}, {"$set": user_update})
    if update_results.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"no record updated")
    updated_user = await collection.find_one({"_id": id})

    return updated_user


@router.delete("/delete_{id}/", response_description="deleted user")
async def delete_user(id: str, response: Response):
    """
    Deletes the Users entry for the given hash;
    Returns a no-content 204 status code
    """
    user = await collection.find_one({"_id": id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"id {id} not found")
    delete_result = await collection.delete_one({"_id": id})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{id} not found")
    else:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

