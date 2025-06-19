from typing import Literal, Optional

import structlog

from ..schemas.category import Category
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class CategoryRepository(PydanticDBRepository[Category]):
    table_name = "category"
    model = Category

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
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            {where_clause}
            ORDER BY {sort_by} {sort_order}
            LIMIT %s OFFSET %s
        """

        params.extend([limit, skip])

        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_total_count(self, search: Optional[str] = None) -> int:
        where_clause = ""
        params = []

        if search:
            where_clause = "WHERE category_name ILIKE %s"
            params.append(f"%{search}%")

        query = f"""
            SELECT COUNT(*)
            FROM {self.table_name}
            {where_clause}
        """

        rows = self._db.execute(query, tuple(params))
        return rows[0][0] if rows else 0

    def get_by_number(self, category_number: int) -> Category | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE category_number = %s
            """,
            (category_number,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def create(self, category_name: str) -> Category:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (category_name)
                VALUES (%s)
                RETURNING {", ".join(self._fields)}
            """,
            (category_name,),
        )
        return self._row_to_model(rows[0])

    def update(self, category_number: int, category_name: str) -> Category:
        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET category_name = %s
                WHERE category_number = %s
                RETURNING {", ".join(self._fields)}
            """,
            (category_name, category_number),
        )
        return self._row_to_model(rows[0])

    def delete(self, category_number: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE category_number = %s
            """,
            (category_number,),
        )

    def delete_multiple(self, category_numbers: list[int]) -> None:
        if not category_numbers:
            return

        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE category_number = ANY(%s)
            """,
            (category_numbers,),
        )
