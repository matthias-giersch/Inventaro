from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import auth as auth_lib
from .. import crud_auth
from ..database_auth import get_auth_session
from ..schemas import TokenResponse, UserCreate, UserLogin
from ..utils import JWTPayload, require_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(
    user_in: UserCreate,
    session: Session = Depends(get_auth_session),
) -> dict:
    existing = crud_auth.get_user_by_email(session, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = auth_lib.get_password_hash(user_in.password)
    user = crud_auth.create_user(session, user_in.email, hashed, "user")
    return {"id": user.id, "email": user.email, "role": user.role}


@router.post("/login", response_model=TokenResponse)
def login(
    user_in: UserLogin,
    session: Session = Depends(get_auth_session),
) -> TokenResponse:
    user = crud_auth.get_user_by_email(session, user_in.email)
    if not user or not auth_lib.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials"
        )
    token = auth_lib.create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/users")
def list_users(
    session: Session = Depends(get_auth_session),
    _: JWTPayload = Depends(require_admin),
) -> list[dict]:
    users = crud_auth.list_users(session)
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]


@router.post("/users/{user_id}/make-admin")
def make_user_admin(
    user_id: int,
    session: Session = Depends(get_auth_session),
    _: JWTPayload = Depends(require_admin),
):
    try:
        user = crud_auth.promote_user_to_admin(session, user_id)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from err

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }


@router.post("/users/{user_id}/make-user")
def make_admin_user(
    user_id: int,
    session: Session = Depends(get_auth_session),
    _: JWTPayload = Depends(require_admin),
):
    try:
        user = crud_auth.promote_admin_to_user(session, user_id)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from err

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }
