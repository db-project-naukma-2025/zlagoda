import logging
from pathlib import Path

from decouple import Config

from ._logging import *  # noqa: F401, F403

CURRENT_PATH = Path(__file__).resolve().parent
BASE_PATH = CURRENT_PATH.parent

config = Config(BASE_PATH)


# Configuration settings

SETTINGS_MODE = config("SETTINGS_MODE", default="dev")


# Database settings

DATABASES = {
    "default": {
        "ENGINE": config("DB_ENGINE", default="sqlite3"),
        "NAME": config("DB_NAME", default=BASE_PATH / "db.sqlite3"),
        "USER": config("DB_USER", default=""),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default=""),
    }
}



# Logging settings

LOG_LEVEL = config("LOG_LEVEL", default="DEBUG")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "format": "%(levelname)s %(asctime)s %(module)s: %(message)s",
            "class": "logging.StreamHandler",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": LOG_LEVEL,
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": True,
        },
    },
}

logging.config.dictConfig(LOGGING)  # type: ignore