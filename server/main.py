import structlog

from . import settings
from .db._base import IDatabase

logger = structlog.getLogger(__name__)


def create_db() -> IDatabase:
    config = settings.DATABASES["default"]
    connection_uri = f"{config['ENGINE']}://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['NAME']}"
    match config["ENGINE"]:
        case "postgres":
            from .db.postgres import PostgresDatabase

            return PostgresDatabase(connection_uri)
        case _:
            raise RuntimeError(f"Unsupported database engine: {config['ENGINE']}")


def main():
    logger.info("start_application")
    db = create_db()
    logger.info("stopped_application")
