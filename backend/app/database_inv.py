import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

from .secrets import read_secret

example_path = Path(".env.example")
load_dotenv(example_path)

INV_POSTGRES_USER = read_secret(Path("/run/secrets/inv_postgres_user"))
INV_POSTGRES_PASSWORD = read_secret(Path("/run/secrets/inv_postgres_password"))
INV_POSTGRES_DB = read_secret(Path("/run/secrets/inv_postgres_db"))

INV_DATABASE_URL = (
    f"postgresql://{INV_POSTGRES_USER}:{INV_POSTGRES_PASSWORD}"
    f"@{os.getenv('AUTH_POSTGRES_HOST', 'inv_db')}:"
    f"{os.getenv('AUTH_POSTGRES_PORT', '5432')}/{INV_POSTGRES_DB}"
)

inv_engine = create_engine(INV_DATABASE_URL)


def init_inv_db() -> None:
    SQLModel.metadata.create_all(inv_engine)


def get_inventory_session() -> Generator[Session, None, None]:
    with Session(inv_engine) as session:
        yield session
