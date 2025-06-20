import click
import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from . import settings
from .cli.commands.create_permissions import CreatePermissionsCommand
from .cli.commands.createuser import Command as CreateUserCommand
from .cli.commands.migrate import Command as DatabaseMigrationCommand
from .ioc_container import (
    create_db,
    database_migration_service,
    group_permission_repository,
    model_registry,
    password_hasher,
    permission_repository,
    registration_controller,
    user_group_repository,
    user_permission_controller,
    user_repository,
)
from .views import auth, category, customer_card, employee, product, store_product

logger = structlog.get_logger(__name__)


@click.group()
def cli():
    """Zlagoda CLI management commands."""
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
        SessionMiddleware,
        secret_key=settings.SECRET_KEY,
        session_cookie="session",
        max_age=2 * 7 * 86400,  # 2 weeks
        path="/",
        domain=settings.API_HOST,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(category.router)
    app.include_router(customer_card.router)
    app.include_router(product.router)
    app.include_router(store_product.router)
    app.include_router(employee.router)
    app.include_router(auth.router)

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

    create_permissions(to_stdout=False)

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


def create_permissions(to_stdout: bool = True):
    with create_db() as db:
        perm_repo = permission_repository(db)
        user_group_repo = user_group_repository(db)
        group_perm_repo = group_permission_repository(db)
        user_perm_controller = user_permission_controller(
            perm_repo, user_group_repo, group_perm_repo
        )

        command = CreatePermissionsCommand(user_perm_controller, model_registry())
        command.execute(to_stdout=to_stdout)


@cli.command(name="create-permissions")
def create_permissions_cli():
    """
    Create basic permissions for all models.

    Note: only models registered in the model registry will be processed.
    """
    create_permissions(to_stdout=True)


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
