# ruff: noqa: F401, F403
from .base import SETTINGS_MODE

match SETTINGS_MODE:
    case "dev":
        from .dev import *
    case "prod":
        from .prod import *
    case _:
        raise RuntimeError(f"Unknown SETTINGS_MODE: {SETTINGS_MODE}")
