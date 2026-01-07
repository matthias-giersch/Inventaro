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
