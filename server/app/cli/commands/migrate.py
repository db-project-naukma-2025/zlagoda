import click

from ...db.migrations import DatabaseMigrationService
from ._base import ICommand


class Command(ICommand):
    def __init__(self, dms: DatabaseMigrationService):
        self.dms = dms

    def execute(self, number: int | None = None):
        click.echo(click.style("Starting migration..."))
        try:
            result = self.dms.migrate(number=number)
        except Exception as e:
            click.echo(click.style(f"Error: {e}", fg="red"))
            return
        if result:
            click.echo(click.style("Migration completed.", fg="green"))
        else:
            click.echo(click.style("No migrations to perform.", fg="yellow"))
