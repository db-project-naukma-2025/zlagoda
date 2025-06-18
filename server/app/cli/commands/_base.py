from typing import Any, Protocol


class ICommand(Protocol):
    def execute(self, *args: Any, **kwargs: Any) -> None: ...
