import click

from ...controllers.roles.employee import UserEmployeePermissionController
from ...dal.repositories.employee import EmployeeRepository
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
        employee_repository: EmployeeRepository,
    ):
        self.user_employee_permission_controller = user_employee_permission_controller
        self.employee_repository = employee_repository

    def execute(self) -> None:
        click.echo(click.style("Updating user permissions...", fg="yellow"))

        employees = self.employee_repository.get_all()

        for employee in employees:
            try:
                self.user_employee_permission_controller.update_related_roles(employee)
            except Exception as e:
                click.echo(
                    click.style(
                        f"Error updating user permissions for employee {employee.id_employee}: {e}",
                        fg="red",
                    )
                )
                continue

        click.echo(click.style("User permissions updated", fg="green"))
