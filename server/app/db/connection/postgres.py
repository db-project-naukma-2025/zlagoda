from typing import Any

import psycopg2
import structlog

from ...decorators import implements
from . import DatabaseError, IDatabase

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
            logger.info("connected")
        except psycopg2.Error as e:
            logger.error("connection.failed")
            raise DatabaseError("Failed to connect to PostgreSQL database") from e
        logger.debug("connected")

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
        logger.debug("execute_query.start", query=query)
        conn = self._must_conn
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                if cursor.description:  # Check if the query returns rows
                    result = cursor.fetchall()
                    logger.debug("execute_query.success", rows=len(result))
                    return result
                else:
                    if self.__commit_mode:
                        conn.commit()  # Commit for non-select queries
                    logger.debug("execute_query.success", rows=0)
                    return []
        except psycopg2.Error as e:
            logger.error("execute_query.failed", error=e)
            raise DatabaseError("Failed to execute query") from e

    @implements
    def disconnect(self):
        logger.debug("disconnect.start")

        if self._conn is None:
            logger.warning("disconnect.no_connection")
            return

        try:
            self._conn.close()
            logger.info("disconnect.success")
        except psycopg2.Error as e:
            logger.error("disconnect.failed")
            raise DatabaseError("Failed to disconnect from PostgreSQL database") from e
        finally:
            self._conn = None

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
