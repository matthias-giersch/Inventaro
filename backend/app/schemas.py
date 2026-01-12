from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    refresh_expires_at: datetime


class CategoryCreate(BaseModel):
    name: str


class ItemCreate(BaseModel):
    name: str
    quantity: int = 0
    location: Optional[str] = None
    extra: Optional[str] = ""


class ItemUpdate(BaseModel):
    name: str
    quantity: int
    location: Optional[str] = None
    extra: Optional[str] = ""
