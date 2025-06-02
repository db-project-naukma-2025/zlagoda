import click
import structlog
import uvicorn
from fastapi import FastAPI

from . import settings
from .db.connection import IDatabase
from .db.migrations import DatabaseMigrationService
from .views import router as views_router

logger = structlog.get_logger(__name__)


def create_db() -> IDatabase:
    config = settings.DATABASES["default"]
    connection_uri = f"{config['ENGINE']}://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['NAME']}"
    match config["ENGINE"]:
        case "postgresql":
            from .db.connection.postgres import PostgresDatabase

            return PostgresDatabase(connection_uri)
        case _:
            raise RuntimeError(f"Unsupported database engine: {config['ENGINE']}")


@click.group()
def cli():
    """Database management commands."""
    pass


@cli.command()
@click.argument("number", type=int, required=False)
def migrate(number: int | None = None):
    """Run database migrations."""
    logger.info("start_migration", target_number=number)
    with create_db() as db:
        dms = DatabaseMigrationService(db, settings.BASE_PATH / "migrations")
        dms.migrate(number=number)
    logger.info("migration_completed", target_number=number)


@cli.command()
def runserver():
    """Run the application."""
    app = FastAPI(title="Zlagoda API", version="0.1.0")
    app.include_router(views_router)

    logger.info("server.starting", host=settings.API_HOST, port=settings.API_PORT)
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
    logger.info("server.stopped", host=settings.API_HOST, port=settings.API_PORT)


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
