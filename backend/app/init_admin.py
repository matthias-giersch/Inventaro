import os
from pathlib import Path

from sqlmodel import Session, select

from .auth import get_password_hash
from .database_auth import auth_engine, init_auth_db
from .models_auth import User


def read_secrets(path: Path):
    if not path:
        return None
    with open(path) as file:
        return file.read().strip()


init_auth_db()

admin_email = read_secrets(Path(os.environ.get("ADMIN_EMAIL_FILE")))
admin_password = read_secrets(Path(os.environ.get("ADMIN_PASSWORD_FILE")))

if not admin_email or not admin_password:
    raise RuntimeError("Admin secrets missing")

with Session(auth_engine) as session:
    statement = select(User).where(User.role == "admin")
    admin_exists = session.exec(statement).first()

    if not admin_exists:
        admin = User(
            email=admin_email,
            hashed_password=get_password_hash(admin_password),
            role="admin",
        )
        session.add(admin)
        session.commit()
