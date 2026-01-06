from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CategoryCreate(BaseModel):
    name: str


class ItemCreate(BaseModel):
    name: str
    quantity: Optional[int] = None
    location: Optional[str] = None
    extra: Optional[str] = ""
