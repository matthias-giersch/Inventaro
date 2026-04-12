from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import crud_inventory
from ..database_inv import get_inventory_session
from ..schemas import CategoryCreate
from ..utils import JWTPayload, get_current_user_id, require_admin

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", status_code=201)
def create_category(
    cat_in: CategoryCreate,
    session: Session = Depends(get_inventory_session),
    user_id: int = Depends(get_current_user_id),
    _: JWTPayload = Depends(require_admin),
) -> dict:
    cat = crud_inventory.create_category(session, cat_in.name, owner_id=user_id)
    return {"id": cat.id, "name": cat.name, "owner_id": cat.owner_id}


@router.get("/", status_code=201)
def list_categories(
    session: Session = Depends(get_inventory_session),
) -> list[dict]:
    cats = crud_inventory.list_categories_for_user(session)
    return [{"id": c.id, "name": c.name} for c in cats]


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    session: Session = Depends(get_inventory_session),
    _: JWTPayload = Depends(require_admin),
) -> dict:
    category = crud_inventory.get_category_by_id(session, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    items = crud_inventory.list_items_for_categeory(session, category_id)
    if items:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category can't be deleted because it still contains items.",
        )
    crud_inventory.delete_category(session, category_id)
    return {"message": "Category deleted"}
