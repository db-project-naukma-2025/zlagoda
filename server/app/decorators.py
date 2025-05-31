import sys
from functools import wraps
from typing import Callable, ParamSpec, TypeVar

from overrides.overrides import _get_base_classes  # noqa: F401

_P = ParamSpec("_P")
_RT = TypeVar("_RT", covariant=True)


def once(func: Callable[_P, _RT]) -> Callable[_P, _RT]:
    called = False
    result: _RT | None = None

    @wraps(func)
    def wrapper(*args: _P.args, **kwargs: _P.kwargs) -> _RT:
        nonlocal called, result
        if called:
            assert result is not None
            return result
        called = True
        result = func(*args, **kwargs)
        return result

    return wrapper


def implements(method: Callable[_P, _RT]) -> Callable[_P, _RT]:
    """
    Decorator that verifies a method implements a protocol method.

    It checks if the method exists in any Protocol base class. If the method exists in
    multiple Protocol base classes, it raises an error. If the method doesn't exist in
    any Protocol base class, it raises an error as well. If the method exists in one of
    the implemented Protocols` parents, it is skipped and error is not raised - only direct
    parents of the given method class are checked for multiple implementation.

    It is important to include the protocol you are implementing at the end of the class bases:
    ```python
    class IStringProvider(Protocol):
        def provider(self) -> str:
            ...

    class UrlProvider(IStringProvider):
        @implements
        def provider(self) -> str:
            return "Hello, world!"

    # This will raise an error
    class GitHubUrlProvider(UrlProvider):
        @implements
        def provider(self) -> str:
            return "https://github.com"

    # This is correct
    class GitHubUrlProvider(UrlProvider, IStringProvider):
        @implements
        def provider(self) -> str:
            return "https://github.com"
    ```
    """
    setattr(method, "__implements__", True)
    global_vars = getattr(method, "__globals__", None)
    if global_vars is None:
        global_vars = vars(sys.modules[method.__module__])
    method_implementation_found = False
    base_classes = _get_base_classes(sys._getframe(2), global_vars)
    direct_parents_implementations = []

    for super_class in base_classes:
        if not hasattr(super_class, "_is_protocol") or not super_class._is_protocol:
            continue

        method_in_direct_parents = method.__name__ in super_class.__dict__
        method_in_all_parent_classes_tree = hasattr(super_class, method.__name__)

        if method_in_all_parent_classes_tree:
            if (
                method_implementation_found
                and method.__name__ in direct_parents_implementations
            ):
                raise TypeError(
                    f"{method.__qualname__}: multiple interfaces with the same method name"
                )

            method_implementation_found = True

        if method_in_direct_parents:
            direct_parents_implementations.append(method.__name__)

    if not method_implementation_found:
        raise TypeError(
            f"{method.__qualname__}: no interface with the method name found"
        )

    return method
