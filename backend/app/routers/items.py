from fastapi import APIRouter, Depends
from sqlmodel import Session

from .. import crud_inventory
from ..database_inv import get_inventory_session
from ..schemas import ItemCreate
from ..utils import JWTPayload, require_admin

router = APIRouter(prefix="/items", tags=["items"])


@router.post("/{category_id}", status_code=201)
def create_item(
    category_id: int,
    item_in: ItemCreate,
    session: Session = Depends(get_inventory_session),
    _: JWTPayload = Depends(require_admin),
) -> dict:
    it = crud_inventory.create_item(
        session,
        category_id,
        item_in.name,
        item_in.quantity,
        item_in.location,
        item_in.extra,
    )
    return {"id": it.id, "name": it.name}


@router.get("/{category_id}", response_model=list[dict])
def list_items(
    category_id: int,
    session: Session = Depends(get_inventory_session),
) -> list[dict]:
    items = crud_inventory.list_items_for_categeory(session, category_id)
    return [
        {
            "id": item.id,
            "name": item.name,
            "quantity": item.quantity,
            "location": item.location,
            "extra": item.extra,
        }
        for item in items
    ]
