from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Final

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from .. import auth as auth_lib
from .. import crud_auth
from ..database_auth import get_auth_session
from ..models_auth import RefreshToken, User
from ..schemas import RefreshTokenRequest, TokenResponse, UserCreate, UserLogin
from ..secrets import read_secret
from ..utils import JWTPayload, require_admin

ADMIN_EMAIL: Final = read_secret(Path("/run/secrets/admin_email"))

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

    access_token = auth_lib.create_access_token(
        {"sub": str(user.id), "role": user.role, "email": user.email}
    )
    refresh_token = auth_lib.create_refresh_token()
    expires_at = datetime.now(timezone.utc) + timedelta(
        days=auth_lib.REFRESH_TOKEN_EXPIRE_DAYS
    )

    session.add(
        RefreshToken(token=refresh_token, user_id=user.id, expires_at=expires_at)
    )
    session.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        refresh_expires_at=expires_at,
    )


@router.post("/logout")
def logout(
    refresh_token: RefreshTokenRequest,
    session: Session = Depends(get_auth_session),
) -> None:
    token_entry = session.exec(
        select(RefreshToken).where(RefreshToken.token == refresh_token.refresh_token)
    ).first()

    if token_entry:
        session.delete(token_entry)
        session.commit()


@router.post("/refresh")
def refresh_access_token(
    refresh_token: RefreshTokenRequest,
    session: Session = Depends(get_auth_session),
) -> dict:
    token_entry = session.exec(
        select(RefreshToken).where(RefreshToken.token == refresh_token.refresh_token)
    ).first()

    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )

    if token_entry.expires_at < datetime.now(timezone.utc):
        session.delete(token_entry)
        session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired"
        )

    user = session.get(User, token_entry.user_id)
    access_token = auth_lib.create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=token_entry.token,
        refresh_expires_at=token_entry.expires_at,
    )


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
            "is_initial_admin": user.email == ADMIN_EMAIL,
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
    payload: JWTPayload = Depends(require_admin),
):
    try:
        user = crud_auth.promote_admin_to_user(session, user_id)
        self_demoted = int(payload["sub"]) == user_id
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from err
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "self_demoted": self_demoted,
    }


@router.delete("/users/{user_id}/delete-user")
def delete_user(
    user_id: int,
    session: Session = Depends(get_auth_session),
    payload: JWTPayload = Depends(require_admin),
):
    try:
        current_user_id = int(payload["sub"])
        self_deleted = crud_auth.delete_user(session, user_id, current_user_id)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        ) from err
    return {
        "deleted_user_id": user_id,
        "self_deleted": self_deleted,
    }
