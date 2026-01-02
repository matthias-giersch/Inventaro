# mypy: ignore-errors
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    __tablename__ = "categories"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    owner_id: int


class CategoryField(SQLModel, table=True):
    __tablename__ = "categories_fields"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = Field(default="category")
    category_id: int


class Item(SQLModel, table=True):
    __tablename__ = "items_fields"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    quantity: int = 0
    location: Optional[str] = None
    category_id: int
    extra: dict = Field(sa_column=Column(JSONB), default={})
