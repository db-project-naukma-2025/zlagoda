import click
import structlog

from . import settings
from .db.connection import IDatabase
from .db.migrations import DatabaseMigrationService

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


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
