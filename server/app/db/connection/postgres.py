from typing import Any

import psycopg2
import structlog

from ...decorators import implements
from . import IDatabase
from .exceptions import DatabaseError, DataError, IntegrityError

logger = structlog.getLogger(__name__)


class PostgresDatabase(IDatabase):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._conn: psycopg2.extensions.connection | None = None
        self.__commit_mode = True

    @implements
    def connect(self):
        logger.debug("connecting")
        try:
            self._conn = psycopg2.connect(self.connection_string)
        except psycopg2.Error as e:
            logger.error("connection.failed")
            raise DatabaseError("Failed to connect to PostgreSQL database") from e
        logger.debug("connected", connection_string=self.connection_string)

    @implements
    def is_connected(self) -> bool:
        return self._conn is not None and not self._conn.closed

    @property
    def _must_conn(self) -> psycopg2.extensions.connection:
        if not self.is_connected():
            raise DatabaseError("Database connection is not established")
        assert self._conn is not None, "Connection should not be None"
        return self._conn

    @implements
    def execute(
        self, query: str, params: tuple[Any, ...] | None = None
    ) -> list[tuple[Any, ...]]:
        formatted_query = " ".join(
            line.strip() for line in query.splitlines() if line.strip()
        )
        logger.debug("execute_query.start", query=formatted_query, params=params)
        conn = self._must_conn
        original_error = None
        new_error = None
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                # Commit for any non-SELECT query when in auto-commit mode
                if self.__commit_mode and not formatted_query.startswith("SELECT"):
                    conn.commit()

                if cursor.description:  # Check if the query returns rows
                    result = cursor.fetchall()
                    logger.debug("execute_query.success", rows=len(result))
                    return result
                else:
                    logger.debug("execute_query.success", rows=0)
                    return []
        except psycopg2.IntegrityError as e:
            original_error = e
            new_error = IntegrityError(e.pgerror)
        except psycopg2.DataError as e:
            original_error = e
            new_error = DataError(e.pgerror)
        except psycopg2.Error as e:
            original_error = e
            new_error = DatabaseError(f"Failed to execute query: {e}")
        except Exception as e:
            original_error = e
            new_error = DatabaseError(f"General error: {e}")

        # * When executing queries, and it fails, connection comes to a faulty state,
        # * So we need to rollback to previous stable state.
        conn.rollback()
        assert original_error is not None and new_error is not None
        raise new_error from original_error

    @implements
    def disconnect(self):
        logger.debug("disconnect.start")

        if self._conn is None:
            logger.debug("disconnect.no_connection")
            return

        try:
            self._conn.close()
        except psycopg2.Error as e:
            logger.error("disconnect.failed")
            raise DatabaseError("Failed to disconnect from PostgreSQL database") from e
        finally:
            self._conn = None
        logger.debug("disconnect.success")

    @implements
    def start_transaction(self):
        self.__commit_mode = False

    @implements
    def commit_transaction(self):
        if not self.__commit_mode:
            self._must_conn.commit()
            self.__commit_mode = True

    @implements
    def rollback_transaction(self):
        if not self.__commit_mode:
            self._must_conn.rollback()
            self.__commit_mode = True
