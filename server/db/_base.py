from typing import Any, Protocol


class IDatabase(Protocol):
    def __init__(self, connection_uri: str): ...

    def connect(self) -> None: ...

    def is_connected(self) -> bool: ...

    def disconnect(self) -> None: ...

    def execute(
        self, query: str, params: tuple[Any, ...] | None = None
    ) -> list[tuple[Any, ...]]: ...

    def __enter__(self) -> "IDatabase":
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.disconnect()


class DatabaseError(Exception):
    """Base class for database-related errors."""

    pass
