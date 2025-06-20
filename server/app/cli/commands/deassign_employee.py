import click

from ...controllers.roles.employee import UserEmployeePermissionController
from ...dal.repositories.auth import UserRepository
from ...dal.schemas.auth import UserUpdate
from ._base import ICommand


class Command(ICommand):
    # Keys for employee table display - can be easily extended
    EMPLOYEE_TABLE_KEYS = [
        "id_employee",
        "empl_surname",
        "empl_name",
        "empl_patronymic",
    ]

    def __init__(
        self,
        user_employee_permission_controller: UserEmployeePermissionController,
        user_repository: UserRepository,
    ):
        self.user_employee_permission_controller = user_employee_permission_controller
        self.user_repository = user_repository

    def execute(self) -> None:
        try:
            user = self._get_user_by_username()

            click.echo(
                click.style(
                    f"You are about to remove employee ({user.id_employee}) from user {user.username}",
                    fg="yellow",
                )
            )
            click.pause()

            self.user_employee_permission_controller.remove_employee(user)

            click.echo(
                click.style(
                    f"Successfully removed employee from user {user.username}",
                    fg="green",
                )
            )
        except KeyboardInterrupt:
            click.echo(click.style("\nOperation aborted", fg="red"))
            raise click.Abort()

    def _get_user_by_username(self):
        """Get user by username with retry on not found."""
        while True:
            try:
                username = click.prompt("Enter username")
                users = self.user_repository.search(UserUpdate(username=username))

                if not users:
                    click.echo(click.style("Username was not found", fg="red"))
                    continue

                return users[0]

            except KeyboardInterrupt:
                click.echo(click.style("\nOperation aborted", fg="red"))
                raise click.Abort()
