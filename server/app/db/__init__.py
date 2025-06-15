from typing import Generator

from .. import settings
from .connection._base import IDatabase


def create_db() -> IDatabase:
    config = settings.DATABASES["default"]
    connection_uri = f"{config['ENGINE']}://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['NAME']}"
    match config["ENGINE"]:
        case "postgresql":
            from .connection.postgres import PostgresDatabase

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
