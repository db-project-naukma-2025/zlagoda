import click
from tabulate import tabulate

from ...controllers.roles.employee import UserEmployeePermissionController
from ...dal.repositories.auth import UserRepository
from ...dal.repositories.employee import EmployeeRepository
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
        employee_repository: EmployeeRepository,
    ):
        self.user_employee_permission_controller = user_employee_permission_controller
        self.user_repository = user_repository
        self.employee_repository = employee_repository

    def execute(self) -> None:
        try:
            # Step 1: Get username and find user
            user = self._get_user_by_username()

            # Step 2: Get employee search query and find employees
            employees = self._search_employees()

            # Step 3: Display employees in ASCII table
            self._display_employees_table(employees)

            # Step 4: Get employee ID selection
            selected_employee = self._select_employee(employees)

            # Step 5: Assign employee to user
            self.user_employee_permission_controller.assign_employee(
                user, selected_employee
            )

            # Step 6: Success message
            click.echo(
                click.style(
                    f"Successfully assigned employee {selected_employee.empl_surname} {selected_employee.empl_name} "
                    f"to user {user.username}",
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

    def _search_employees(self):
        """Search employees by surname."""
        while True:
            try:
                surname_query = click.prompt("Enter employee surname to search")
                employees = self.employee_repository.get_all(
                    search=surname_query,
                    limit=None,  # No limit - find all matching employees
                    skip=0,
                )

                if not employees:
                    click.echo(
                        click.style(
                            f"No employees found with surname containing '{surname_query}'",
                            fg="yellow",
                        )
                    )
                    continue

                return employees

            except KeyboardInterrupt:
                click.echo(click.style("\nOperation aborted", fg="red"))
                raise click.Abort()

    def _display_employees_table(self, employees):
        """Display employees in a pretty ASCII table."""
        if not employees:
            return

        # Prepare table data
        headers = self.EMPLOYEE_TABLE_KEYS
        rows = []

        for employee in employees:
            row = []
            for key in self.EMPLOYEE_TABLE_KEYS:
                value = getattr(employee, key, "")
                row.append(value if value is not None else "")
            rows.append(row)

        # Display table
        click.echo("\nFound employees:")
        click.echo(tabulate(rows, headers=headers, tablefmt="grid") + "\n")

    def _select_employee(self, employees):
        """Select employee by ID with retry on not found."""
        # Create a mapping of employee IDs to employee objects for quick lookup
        employee_map = {emp.id_employee: emp for emp in employees}

        while True:
            try:
                employee_id = click.prompt("Enter employee ID")

                if employee_id not in employee_map:
                    click.echo(
                        click.style("Employee ID was not found, try again", fg="red")
                    )
                    continue

                return employee_map[employee_id]

            except KeyboardInterrupt:
                click.echo(click.style("\nOperation aborted", fg="red"))
                raise click.Abort()
