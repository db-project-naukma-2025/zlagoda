from contextlib import contextmanager
from typing import Any, Protocol


class IQueryExecutable(Protocol):
    def execute(
        self, query: str, params: tuple[Any, ...] | None = None
    ) -> list[tuple[Any, ...]]: ...


class IDatabase(IQueryExecutable, Protocol):
    def __init__(self, connection_uri: str): ...

    def connect(self) -> None: ...
    def is_connected(self) -> bool: ...
    def disconnect(self) -> None: ...

    def start_transaction(self): ...
    def commit_transaction(self): ...
    def rollback_transaction(self): ...

    def __enter__(self) -> "IDatabase":
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        self.disconnect()


@contextmanager
def transaction(database: IDatabase):
    database.start_transaction()
    try:
        yield
    except:
        database.rollback_transaction()
        raise
    else:
        database.commit_transaction()
