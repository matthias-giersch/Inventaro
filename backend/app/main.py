import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database_auth import init_auth_db
from .database_inv import init_inv_db
from .routers import auth as auth_router
from .routers import categories as categories
from .routers import items as items

example_path = Path(".env.example")
load_dotenv(example_path)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    init_auth_db()
    init_inv_db()
    yield


app = FastAPI(title="Inventaro", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
)

app.include_router(auth_router.router)
app.include_router(categories.router)
app.include_router(items.router)
