import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

from .secrets import read_secret

example_path = Path(".env.example")
load_dotenv(example_path)

AUTH_POSTGRES_USER = read_secret(Path("/run/secrets/auth_postgres_user"))
AUTH_POSTGRES_PASSWORD = read_secret(Path("/run/secrets/auth_postgres_password"))
AUTH_POSTGRES_DB = read_secret(Path("/run/secrets/auth_postgres_db"))

AUTH_DATABASE_URL = (
    f"postgresql://{AUTH_POSTGRES_USER}:{AUTH_POSTGRES_PASSWORD}"
    f"@{os.getenv('AUTH_POSTGRES_HOST', 'auth_db')}:"
    f"{os.getenv('AUTH_POSTGRES_PORT', '5432')}/{AUTH_POSTGRES_DB}"
)

auth_engine = create_engine(AUTH_DATABASE_URL)


def init_auth_db() -> None:
    SQLModel.metadata.create_all(auth_engine)


def get_auth_session() -> Generator[Session, None, None]:
    with Session(auth_engine) as session:
        yield session
