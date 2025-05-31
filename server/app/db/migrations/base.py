import re
from pathlib import Path
from typing import cast as typecast

import structlog

from ..connection import DatabaseError, IDatabase, transaction

logger = structlog.get_logger(__name__)


class MigrationError(DatabaseError):
    pass


class DatabaseMigrationService:
    TABLE_NAME = "system_migrations"

    CREATE_TABLE_QUERY = f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        id INTEGER PRIMARY KEY,
        migration VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    """
    SELECT_MIGRATIONS_QUERY = f"SELECT id, migration FROM {TABLE_NAME} ORDER BY id ASC"
    INSERT_MIGRATION_QUERY = f"INSERT INTO {TABLE_NAME} (id, migration) VALUES (%s, %s)"
    DELETE_MIGRATION_QUERY = f"DELETE FROM {TABLE_NAME} WHERE id = %s"

    FORWARD_MIGRATION_PATTERN = r"^([0-9]{3})_[^\.\s]+$"
    FORWARD_MIGRATION_FILE_PATTERN = r"^([0-9]{3})_[^\.\s]+\.sql$"
    BACKWARD_MIGRATION_FILE_PATTERN = r"^([0-9]{3})_[^\.\s]+\.reverse\.sql$"

    def __init__(self, database: IDatabase, migrations_dir: Path):
        if not database.is_connected():
            raise RuntimeError("Database is not connected")

        self.database = database
        self.migrations_dir = migrations_dir
        self._prepare_table()

    def _prepare_table(self):
        try:
            self.database.execute(self.CREATE_TABLE_QUERY)
        except DatabaseError as e:
            raise MigrationError(f"failed to prepare migrations table: {e}") from e

    def _validate_migrations(self, migrations: list[tuple[int, str]]):
        logger.debug("migrations.validation", migrations=migrations)
        numbers = set()
        for number, _ in migrations:
            if number in numbers:
                raise MigrationError(
                    f"multiple migrations with the same number: {number}"
                )
            numbers.add(number)

    def _cross_validate_migrations(
        self, available: list[tuple[int, str]], executed: list[tuple[int, str]]
    ):
        logger.debug(
            "migrations.cross_validation", available=available, executed=executed
        )
        available_map = {x[0]: x[1] for x in available}
        for number, fw_migration in executed:
            if number not in available_map:
                raise MigrationError(f"executed non-existent migration: {number}")

            if available_map[number] != fw_migration:
                raise MigrationError(f"migration mismatch: {number}")

    def get_executed_migrations(self) -> list[tuple[int, str]]:
        try:
            results = self.database.execute(self.SELECT_MIGRATIONS_QUERY)
        except DatabaseError as e:
            raise MigrationError(f"failed to get executed migrations: {e}") from e

        logger.debug("migrations.executed", results=results)

        return typecast(list[tuple[int, str]], results)

    def get_available_migrations(self) -> list[tuple[int, str]]:
        migrations = []
        for x in self.migrations_dir.iterdir():
            if not x.is_file():
                continue

            match = re.match(self.FORWARD_MIGRATION_FILE_PATTERN, x.name)
            if not match:
                continue

            number = int(match.group(1))
            migrations.append((number, x.stem))

        self._validate_migrations(migrations)
        logger.debug("migrations.available", migrations=migrations)
        return sorted(migrations)

    def _find_backward_migration(self, fw_migration: str) -> str | None:
        all_backward = [
            (x.stem.rstrip(".reverse"), x.stem)
            for x in self.migrations_dir.iterdir()
            if x.is_file() and re.match(self.BACKWARD_MIGRATION_FILE_PATTERN, x.name)
        ]

        for stem, filename in all_backward:
            if stem == fw_migration:
                return filename
        logger.debug("migrations.backward_not_found", fw_migration=fw_migration)
        return None

    def migrate(self, *, number: int | None = None):
        available = self.get_available_migrations()
        executed = self.get_executed_migrations()

        self._cross_validate_migrations(available, executed)

        if number:
            available = [x for x in available if x[0] <= number]

        if len(available) == len(executed):
            return

        if len(available) > len(executed):
            to_be_executed = available[len(executed) :]

            # forward migration
            for number, fw_migration in to_be_executed:
                with open(self.migrations_dir / f"{fw_migration}.sql", "r") as f:
                    sql = f.read()

                with transaction(self.database):
                    self.database.execute(sql)
                    self.database.execute(
                        self.INSERT_MIGRATION_QUERY,
                        (number, fw_migration),
                    )
            return

        # backward migration
        to_be_executed = executed[len(available) :][::-1]

        for number, fw_migration in to_be_executed:
            bw_migration = self._find_backward_migration(fw_migration)
            if bw_migration is None:
                continue

            with open(self.migrations_dir / f"{bw_migration}.sql", "r") as f:
                sql = f.read()

            with transaction(self.database):
                self.database.execute(sql)
                self.database.execute(self.DELETE_MIGRATION_QUERY, (number,))
