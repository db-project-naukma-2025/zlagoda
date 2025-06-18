import getpass

import click

from ...controllers.auth.registration import RegistrationController
from ._base import ICommand


class Command(ICommand):
    def __init__(self, registration_controller: RegistrationController):
        self.controller = registration_controller

    def execute(self, superuser: bool = False):
        try:
            # Ask for username
            username = click.prompt("Username", type=str).strip()

            # Check if username exists

            existing_user = self.controller.exists(username)

            if existing_user:
                click.echo(
                    click.style(
                        f"Error: Username '{username}' already exists", fg="red"
                    )
                )
                return

            # Ask for password securely
            while True:
                password = getpass.getpass("Password: ")
                if not password.strip():
                    click.echo(click.style("Error: Password cannot be empty", fg="red"))
                    continue

                password_confirm = getpass.getpass("Password (again): ")
                if password != password_confirm:
                    click.echo(click.style("Error: Passwords don't match", fg="red"))
                    continue
                break

            # Create the user
            user = self.controller.register(
                username=username, password=password, is_superuser=superuser
            )

            user_type = "Superuser" if superuser else "User"
            click.echo(
                click.style(
                    f"{user_type} '{username}' created successfully (pk={user.id})",
                    fg="green",
                )
            )

        except click.Abort:
            click.echo("\nOperation cancelled.")
        except Exception as e:
            click.echo(click.style(f"\nError creating user: {e}", fg="red"))
