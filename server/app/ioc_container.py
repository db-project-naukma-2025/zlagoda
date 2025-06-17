from typing import Generator

from fastapi import Depends

from . import settings
from .dal.repositories.category import CategoryRepository
from .db.connection._base import IDatabase

# Database setup


def create_db() -> IDatabase:
    config = settings.DATABASES["default"]
    connection_uri = f"{config['ENGINE']}://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['NAME']}"
    match config["ENGINE"]:
        case "postgresql":
            from .db.connection.postgres import PostgresDatabase

            return PostgresDatabase(connection_uri)
        case _:
            raise RuntimeError(f"Unsupported database engine: {config['ENGINE']}")


def get_db() -> Generator[IDatabase, None, None]:
    db = create_db()
    db.connect()
    try:
        yield db
    finally:
        db.disconnect()


# DAL setup


def get_category_repository(db: IDatabase = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(db)
