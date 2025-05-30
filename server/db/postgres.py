from typing import Any

import psycopg2
import structlog

from ..typing import implements
from ._base import DatabaseError, IDatabase

logger = structlog.getLogger(__name__)


class PostgresDatabase(IDatabase):
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self._conn: psycopg2.extensions.connection | None = None

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
        logger.debug("executing query: %s", query)
        try:
            with self._must_conn.cursor() as cursor:
                cursor.execute(query, params)
                if cursor.description:  # Check if the query returns rows
                    result = cursor.fetchall()
                    logger.debug(
                        "query executed successfully, fetched %d rows", len(result)
                    )
                    return result
                else:
                    self._must_conn.commit()  # Commit for non-select queries
                    logger.debug("query executed successfully, no rows returned")
                    return []
        except psycopg2.Error as e:
            logger.error("query.execution.failed: %s", e)
            raise DatabaseError("Failed to execute query") from e

    @implements
    def disconnect(self):
        logger.debug("disconnecting")
        if self._conn is not None:
            try:
                self._conn.close()
                logger.info("disconnected")
            except psycopg2.Error as e:
                logger.error("disconnection.failed")
                raise DatabaseError(
                    "Failed to disconnect from PostgreSQL database"
                ) from e
            finally:
                self._conn = None
        else:
            logger.warning("disconnect called but no connection exists")
        logger.debug("disconnected")
