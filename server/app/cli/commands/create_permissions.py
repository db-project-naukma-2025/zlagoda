import click

from ...controllers.permissions.user import UserPermissionController
from ...decorators import implements
from ._base import ICommand


class CreatePermissionsCommand(ICommand):
    def __init__(
        self,
        user_permission_controller: UserPermissionController,
        model_registry: set[type],
    ):
        self.user_permission_controller = user_permission_controller
        self.model_registry = model_registry

    @implements
    def execute(self, *, to_stdout: bool = True):
        if to_stdout:
            click.echo("Creating basic permissions for all models...")
        for model in self.model_registry:
            if to_stdout:
                click.echo(f"Creating for {model.__name__}...\t", nl=False)
            try:
                _, created = self.user_permission_controller.create_basic_permissions(
                    model
                )
            except Exception as e:
                if to_stdout:
                    click.echo(
                        click.style(
                            f"Failed to create basic permissions for {model.__name__}: {e}",
                            fg="red",
                        )
                    )
                raise
            else:
                text, fg = (
                    (" Done.", "green") if created else (" Already exists.", None)
                )
                if to_stdout:
                    click.echo(click.style(text, fg=fg))
        if to_stdout:
            click.echo(
                click.style("Basic permissions created successfully.", fg="green")
            )
