import click
import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import settings
from .cli.commands.createuser import Command as CreateUserCommand
from .cli.commands.migrate import Command as DatabaseMigrationCommand
from .ioc_container import (
    create_db,
    database_migration_service,
    password_hasher,
    registration_controller,
    user_repository,
)
from .views import category, customer_card

logger = structlog.get_logger(__name__)


@click.group()
def cli():
    """Database management commands."""
    pass


@cli.command()
@click.argument("number", type=int, required=False)
def migrate(number: int | None = None):
    """Run database migrations."""
    with create_db() as db:
        dms = database_migration_service(db)
        dmc = DatabaseMigrationCommand(dms)
        dmc.execute(number=number)


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
    app.include_router(customer_card.router)

    click.echo(
        click.style(f"Starting server on {settings.API_HOST}:{settings.API_PORT}...")
    )

    with create_db() as db:
        dms = database_migration_service(db)
        executed = dms.get_executed_migrations()
        available = dms.get_available_migrations()

    if executed != available:
        click.echo(
            click.style(
                f"You have {len(available) - len(executed)} unapplied migration(s). "
                "Your project may not work properly until you apply the migrations.\n"
                "Run 'python manage.py migrate' to apply them.",
                fg="red",
            )
        )

    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
    )
    click.echo(click.style("Server stopped."))


@cli.command()
@click.option("--superuser", is_flag=True, help="Create a superuser account.")
def createuser(superuser: bool = False):
    """Create a new user."""
    with create_db() as db:
        repo = user_repository(db)
        controller = registration_controller(repo, password_hasher())
        command = CreateUserCommand(controller)
        command.execute(superuser=superuser)


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
