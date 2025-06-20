import click

from ...controllers.check import CheckCleanupController
from ._base import ICommand


class ClearAllChecksCommand(ICommand):
    def __init__(self, cleanup_controller: CheckCleanupController):
        self.cleanup_controller = cleanup_controller

    def execute(self) -> None:
        if click.confirm(
            "Are you sure you want to delete ALL checks? This cannot be undone."
        ):
            self.cleanup_controller.delete_all_checks()
            click.echo("Deleted all checks")
        else:
            click.echo("Operation cancelled")
