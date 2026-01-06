# mypy: ignore-errors
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    __tablename__ = "categories"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    owner_id: int
    items: list["Item"] = Relationship(back_populates="category")


class CategoryField(SQLModel, table=True):
    __tablename__ = "categories_fields"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str = Field(default="category")
    category_id: int = Field(foreign_key="categories.id", nullable=False)


class Item(SQLModel, table=True):
    __tablename__ = "items"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    quantity: int
    location: Optional[str] = None
    category_id: int = Field(foreign_key="categories.id", nullable=False)
    category: Optional[Category] = Relationship(back_populates="items")
    extra: Optional[str] = Field(default="")
