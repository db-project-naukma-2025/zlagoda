import click
import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import settings
from .db.migrations import DatabaseMigrationService
from .ioc_container import create_db
from .views import category

logger = structlog.get_logger(__name__)


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

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(category.router)

    logger.info("server.starting", host=settings.API_HOST, port=settings.API_PORT)
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
    logger.info("server.stopped", host=settings.API_HOST, port=settings.API_PORT)


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
