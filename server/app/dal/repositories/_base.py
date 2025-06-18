from abc import ABC
from typing import Any, Generic, Type, TypeVar

from pydantic import BaseModel

from ...db.connection._base import IDatabase

_T_BaseModel = TypeVar("_T_BaseModel", bound=BaseModel)


class DBRepository(ABC):
    table_name: str

    def __init__(self, db: IDatabase):
        self._db = db


class PydanticDBRepository(DBRepository, Generic[_T_BaseModel]):
    model: Type[_T_BaseModel]

    @property
    def _fields(self) -> list[str]:
        return list(self.model.model_fields.keys())

    def _row_to_model(self, row: tuple[Any, ...]) -> _T_BaseModel:
        return self.model(**dict(zip(self._fields, row)))
