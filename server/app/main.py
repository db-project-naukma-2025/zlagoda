import click
import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from . import settings
from .cli.commands.assign_employee import Command as AssignEmployeeCommand
from .cli.commands.clear_all_checks import ClearAllChecksCommand
from .cli.commands.create_permissions import CreatePermissionsCommand
from .cli.commands.createuser import Command as CreateUserCommand
from .cli.commands.deassign_employee import Command as DeassignEmployeeCommand
from .cli.commands.migrate import Command as DatabaseMigrationCommand
from .cli.commands.update_user_permissions import (
    Command as UpdateUserPermissionsCommand,
)
from .ioc_container import (
    check_repository,
    create_db,
    customer_card_repository,
    database_migration_service,
    employee_repository,
    group_permission_repository,
    group_repository,
    model_registry,
    password_hasher,
    permission_repository,
    registration_controller,
    sale_repository,
    store_product_repository,
    user_cashier_permission_controller,
    user_employee_permission_controller,
    user_group_controller,
    user_group_repository,
    user_manager_permission_controller,
    user_permission_controller,
    user_repository,
)
from .views import (
    auth,
    category,
    check,
    customer_card,
    employee,
    product,
    store_product,
)

logger = structlog.get_logger(__name__)


def basic_checks():
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
    init_roles()
    update_user_permissions()


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


@cli.command(name="clear-all-checks")
def clear_all_checks():
    """Clear all checks with confirmation."""
    with create_db() as db:
        from .controllers.check import CheckCleanupController

        check_repo = check_repository(db)
        customer_card_repo = customer_card_repository(db)
        store_product_repo = store_product_repository(db)
        sale_repo = sale_repository(db)
        cleanup_controller = CheckCleanupController(
            check_repo, customer_card_repo, store_product_repo, sale_repo
        )

        command = ClearAllChecksCommand(cleanup_controller)
        command.execute()


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
    app.include_router(check.router)
    app.include_router(employee.router)
    app.include_router(auth.router)

    click.echo(
        click.style(f"Starting server on {settings.API_HOST}:{settings.API_PORT}...")
    )

    basic_checks()

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


def init_roles():
    with create_db() as db:
        # Create repositories
        perm_repo = permission_repository(db)
        user_group_repo = user_group_repository(db)
        group_perm_repo = group_permission_repository(db)
        group_repo = group_repository(db)

        # Create controllers
        user_perm_controller = user_permission_controller(
            perm_repo, user_group_repo, group_perm_repo
        )
        group_controller = user_group_controller(
            group_repo, user_group_repo, group_perm_repo
        )

        # Create role controllers
        cashier_controller = user_cashier_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )
        manager_controller = user_manager_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )

        cashier_controller.init_role()
        manager_controller.init_role()


@cli.command(name="init-roles")
def init_roles_cli():
    """
    Initialize roles.
    """
    init_roles()


@cli.command()
@click.option(
    "-i", "--interface", type=click.Choice(["ipython", "python"]), default="ipython"
)
def shell(interface: str):
    """
    Start an interactive shell with the application context.
    """
    basic_checks()

    if interface == "ipython":
        try:
            from IPython import start_ipython  # type: ignore
            from IPython.terminal.ipapp import load_default_config  # type: ignore
        except ImportError:
            interface = "python"
        else:
            config = load_default_config()
            start_ipython(argv=[], config=config, user_ns=globals())
            return

    if interface == "python":
        import code

        try:
            import readline  # type: ignore
            import rlcompleter  # type: ignore

            readline.set_completer(rlcompleter.Completer(globals()).complete)
        except ImportError:
            pass

        code.interact(local=globals())
        return

    raise ValueError(f"Invalid interface: {interface}")


@cli.command(name="assign-employee")
def assign_employee():
    """Assign an employee to a user interactively."""
    with create_db() as db:
        # Create repositories
        user_repo = user_repository(db)
        emp_repo = employee_repository(db)
        perm_repo = permission_repository(db)
        user_group_repo = user_group_repository(db)
        group_perm_repo = group_permission_repository(db)
        group_repo = group_repository(db)

        # Create controllers
        user_perm_controller = user_permission_controller(
            perm_repo, user_group_repo, group_perm_repo
        )
        group_controller = user_group_controller(
            group_repo, user_group_repo, group_perm_repo
        )

        # Create role controllers
        cashier_controller = user_cashier_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )
        manager_controller = user_manager_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )

        # Create employee permission controller
        employee_controller = user_employee_permission_controller(
            cashier_controller, manager_controller, user_repo, emp_repo
        )

        # Create and execute command
        command = AssignEmployeeCommand(employee_controller, user_repo, emp_repo)
        command.execute()


@cli.command(name="deassign-employee")
def deassign_employee():
    """De-assign an employee from a user interactively."""
    with create_db() as db:
        # Create repositories
        user_repo = user_repository(db)
        emp_repo = employee_repository(db)
        perm_repo = permission_repository(db)
        user_group_repo = user_group_repository(db)
        group_perm_repo = group_permission_repository(db)
        group_repo = group_repository(db)

        # Create controllers
        user_perm_controller = user_permission_controller(
            perm_repo, user_group_repo, group_perm_repo
        )
        group_controller = user_group_controller(
            group_repo, user_group_repo, group_perm_repo
        )

        # Create role controllers
        cashier_controller = user_cashier_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )
        manager_controller = user_manager_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )

        # Create employee permission controller
        employee_controller = user_employee_permission_controller(
            cashier_controller, manager_controller, user_repo, emp_repo
        )

        command = DeassignEmployeeCommand(employee_controller, user_repo)
        command.execute()


def update_user_permissions():
    """Update user permissions for all employees."""
    with create_db() as db:
        # Create repositories
        user_repo = user_repository(db)
        emp_repo = employee_repository(db)
        perm_repo = permission_repository(db)
        user_group_repo = user_group_repository(db)
        group_perm_repo = group_permission_repository(db)
        group_repo = group_repository(db)

        # Create controllers
        user_perm_controller = user_permission_controller(
            perm_repo, user_group_repo, group_perm_repo
        )
        group_controller = user_group_controller(
            group_repo, user_group_repo, group_perm_repo
        )

        # Create role controllers
        cashier_controller = user_cashier_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )
        manager_controller = user_manager_permission_controller(
            user_perm_controller,
            group_controller,
            group_repo,
            user_group_repo,
            group_perm_repo,
        )

        # Create employee permission controller
        employee_controller = user_employee_permission_controller(
            cashier_controller, manager_controller, user_repo, emp_repo
        )

        command = UpdateUserPermissionsCommand(employee_controller, emp_repo)
        command.execute()


@cli.command(name="update-user-permissions")
def update_user_permissions_cli():
    """Update user permissions for all employees."""
    update_user_permissions()


def main():
    """Entry point for the application."""
    cli()


if __name__ == "__main__":
    main()
