from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from .models_inventory import Category, CategoryField, Item


def create_category(session: Session, name: str, owner_id: int) -> Category:
    cat = Category(name=name, owner_id=owner_id)
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def add_field_to_category(
    session: Session, category_id: int, name: str, type: str = "string"
) -> CategoryField:
    field = CategoryField(name=name, type=type, category_id=category_id)
    session.add(field)
    session.commit()
    session.refresh(field)
    return field


def list_categories_for_user(session: Session) -> list[Category]:
    statement = select(Category)
    result = session.exec(statement).all()
    return result


def create_item(
    session: Session,
    category_id: int,
    name: str,
    quantity: int,
    location: str | None = None,
    extra: str | None = None,
) -> Item:
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    item = Item(
        name=name,
        quantity=quantity,
        location=location,
        category_id=category_id,
        extra=extra or "",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def list_items_for_categeory(session: Session, category_id: int) -> list[Item]:
    statement = select(Item).where(Item.category_id == category_id)
    result = session.exec(statement).all()
    return result


def update_item(session: Session, item_id: int, item_in) -> Item:
    item = session.get(Item, item_id)
    if item_in.name is not None:
        item.name = item_in.name
    if item_in.quantity is not None:
        item.quantity = item_in.quantity
    if item_in.location is not None:
        item.location = item_in.location
    if item_in.extra is not None:
        item.extra = item_in.extra
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item_id: int) -> None:
    item = session.get(Item, item_id)
    session.delete(item)
    session.commit()


def delete_category(session: Session, category_id: int) -> None:
    category = session.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    item_count = session.exec(
        select(func.count(Item.id)).where(Item.category_id == category_id)
    ).one()

    if item_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category can't be deleted because it still contains items.",
        )

    session.delete(category)
    session.commit()


def category_with_items_count(session: Session) -> list[dict[str, Any]]:
    statement = (
        select(Category, func.count(Item.id).label("item_count"))
        .outerjoin(Item, Item.category_id == Category.id)
        .group_by(Category.id)
    )
    results = session.exec(statement).all()
    return [
        {
            "id": category.id,
            "name": category.name,
            "item_count": item_count,
        }
        for category, item_count in results
    ]


def get_category_by_id(session: Session, category_id: int) -> Optional[Category]:
    statement = select(Category).where(Category.id == category_id)
    return session.exec(statement).first()
