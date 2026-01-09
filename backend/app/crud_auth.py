from pathlib import Path
from typing import Final, Optional

from fastapi import HTTPException, status
from sqlmodel import Session, select

from .models_auth import User
from .secrets import read_secret

ADMIN_EMAIL: Final = read_secret(Path("/run/secrets/admin_email"))


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    return session.exec(select(User).where(User.email == email)).first()


def create_user(
    session: Session, email: str, hashed_password: str, role: str = "user"
) -> User:
    user = User(email=email, hashed_password=hashed_password, role=role)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def promote_user_to_admin(session: Session, user_id: int) -> User:
    user = session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    user.role = "admin"
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def promote_admin_to_user(session: Session, user_id: int) -> User:
    user = session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    user.role = "user"
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def list_users(session: Session) -> list[User]:
    statement = select(User)
    return session.exec(statement).all()


def delete_user(session: Session, user_id: int) -> None:
    user = session.get(User, user_id)
    if user.email == ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The initial admin can't be deleted",
        )
    if not user:
        raise ValueError("User not found")
    session.delete(user)
    session.commit()
