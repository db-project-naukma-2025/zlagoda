from typing import Any, Literal, Optional

import structlog

from ...db.connection._base import IDatabase
from ..schemas.category import Category

logger = structlog.get_logger(__name__)


class CategoryRepository:
    _table_name = "category"
    _fields = Category.model_fields

    def __init__(self, db: IDatabase):
        self._db = db

    def _row_to_category(self, row: tuple[Any, ...]) -> Category:
        return Category(**dict(zip(self._fields.keys(), row)))

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Literal["category_number", "category_name"] = "category_number",
        sort_order: Literal["asc", "desc"] = "asc",
    ) -> list[Category]:
        where_clause = ""
        params = []

        if search:
            where_clause = "WHERE category_name ILIKE %s"
            params.append(f"%{search}%")

        query = f"""
            SELECT {", ".join(self._fields.keys())}
            FROM {self._table_name}
            {where_clause}
            ORDER BY {sort_by} {sort_order}
            LIMIT %s OFFSET %s
        """

        params.extend([limit, skip])

        rows = self._db.execute(query, tuple(params))
        return [self._row_to_category(row) for row in rows]

    def get_total_count(self, search: Optional[str] = None) -> int:
        where_clause = ""
        params = []

        if search:
            where_clause = "WHERE category_name ILIKE %s"
            params.append(f"%{search}%")

        query = f"""
            SELECT COUNT(*)
            FROM {self._table_name}
            {where_clause}
        """

        rows = self._db.execute(query, tuple(params))
        return rows[0][0] if rows else 0

    def get_by_number(self, category_number: int) -> Category | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields.keys())}
                FROM {self._table_name}
                WHERE category_number = %s
                """,
            (category_number,),
        )
        return self._row_to_category(rows[0]) if rows else None

    def create(self, category_name: str) -> Category:
        rows = self._db.execute(
            f"""
                INSERT INTO {self._table_name} (category_name)
                VALUES (%s)
                RETURNING {", ".join(self._fields.keys())}
                """,
            (category_name,),
        )
        return self._row_to_category(rows[0])

    def update(self, category_number: int, category_name: str) -> Category:
        rows = self._db.execute(
            f"""
                UPDATE {self._table_name}
                SET category_name = %s
                WHERE category_number = %s
                RETURNING {", ".join(self._fields.keys())}
                """,
            (category_name, category_number),
        )
        return self._row_to_category(rows[0])

    def delete(self, category_number: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self._table_name}
                WHERE category_number = %s
                """,
            (category_number,),
        )

    def delete_multiple(self, category_numbers: list[int]) -> None:
        if not category_numbers:
            return

        self._db.execute(
            f"""
                DELETE FROM {self._table_name}
                WHERE category_number IN ({", ".join(["%s"] * len(category_numbers))})
                """,
            tuple(category_numbers),
        )
