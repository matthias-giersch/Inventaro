# mypy: ignore-errors
from typing import Optional

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
