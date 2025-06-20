from abc import ABC
from typing import Any, Generic, Type, TypeVar

from pydantic import BaseModel

from ...db.connection._base import IDatabase
from ..schemas._base import UNSET

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
        if len(row) != len(self._fields):
            raise ValueError(
                f"Row has {len(row)} columns, but model has {len(self._fields)} fields"
            )
        return self.model(**dict(zip(self._fields, row)))

    def _construct_clauses(
        self,
        fields: list[str],
        parameters: BaseModel | None = None,
        *,
        exclude_fields: list[str] | None = None,
    ) -> tuple[list[str], list[Any]]:
        clauses, params = [], []
        if parameters is not None and exclude_fields is not None:
            filtered_fields = [field for field in fields if field not in exclude_fields]

            filter_values = {}
            for field in filtered_fields:
                value = getattr(parameters, field, UNSET)
                if value is UNSET:
                    continue
                filter_values[field] = value

            for field, value in filter_values.items():
                clauses.append(f"{field} = %s")
                params.append(value)

        return clauses, params
