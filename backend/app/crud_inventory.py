from sqlmodel import Session, select

from .models_inventory import Category, CategoryField


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
    return session.exec(select(Category).where(Category.owner_id == user_id)).all()
