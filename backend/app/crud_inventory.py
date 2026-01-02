from sqlmodel import Session, select

from .models_inventory import Category, CategoryField, Item


def create_category(session: Session, owner_id: int, name: str) -> Category:
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


def list_categories_for_user(session: Session, user_id: int) -> list[Category]:
    statement = select(Category).where(Category.owner_id == user_id)
    result = session.exec(statement).all()
    return result


def create_item(
    session: Session,
    category_id: int,
    name: str,
    quantity: int = 0,
    location: str | None = None,
    extra: dict | None = None,
) -> Item:
    item = Item(
        name=name,
        quantity=quantity,
        location=location,
        category_id=category_id,
        extra=extra or {},
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def list_items_for_categeory(session: Session, category_id: int) -> list[Item]:
    statement = select(Item).where(Item.category_id == category_id)
    result = session.exec(statement).all()
    return result
