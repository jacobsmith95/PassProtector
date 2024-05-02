from pydantic import BaseModel, Field
from typing import Optional
import uuid


class UserSchema(BaseModel):
    """
    The model for a user in the mongodb Users collection:

    id    - id auto-generated by mongodb upon creation
    email - user's email entered on account creation saved as a string
    hash  - user's unique master hash generated on account creation saved as a string
    token - a secret used for Google TOTP MFA
    vault - user's encrypted data and IV saved as a concatenated string, can be None
    """
    id: str = Field(default_factory=uuid.uuid1, alias="_id")
    email: str = Field(...)
    hash: str = Field(...)
    token: str = Field(...)
    vault: str | None = Field(...)

    class Config:
        populate_by_name = True
    

class UserUpdate(BaseModel):
    """
    The model for updating a user in the mongodb Users collection:
    
    email - optional to update
    hash  - optional to update
    token - optional to update
    vault - optional to update
    """
    email: Optional[str]
    hash: Optional[str]
    token: Optional[str]
    vault: Optional[str]


class HashSchema(BaseModel):
    """
    Allows functions to parse request bodies that only include a hash
    """
    hash: str = Field(...)


def LoginResponseSchema(vault):
    """
    Defines the dictionary reponse sent back as the response body for routes:

    login_result    - whether the operation resulted in success or not
    login_body      - the information returned to the request
    encrypted_vault - the user's vault as an encrypted string
    """
    login_response = {
        "login_result"    : "success",
        "login_body"      : None,
        "encrypted_vault" : vault
    }

    return login_response


def CreateResponseSchema(status, message, data, vault):
    """
    Defines the dictionary reponse sent back as the response body for routes:

    login_result    - whether the operation resulted in success or not
    login_body      - the information returned to the request
    encrypted_vault - the user's vault as an encrypted string
    """
    create_response = {
        "login_result"    : message,
        "login_body"      : [data],
        "encrypted_vault" : vault
    }

    return create_response


def LoginErrorSchema(result):
    """
    Defines the dictionary error response sent back as the error body for routes:

    login_result - the error that occurred
    """
    error = {
        "login_result": result
    }

    return error