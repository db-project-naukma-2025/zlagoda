from datetime import date
from typing import Any, Literal, Optional

import structlog

from ..schemas.check import RelationalCheck
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class CheckRepository(PydanticDBRepository[RelationalCheck]):
    table_name = '"check"'  # reserved keyword
    model = RelationalCheck

    def get_all(
        self,
        skip: int = 0,
        limit: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        employee_id: Optional[str] = None,
        sort_by: Literal["print_date", "sum_total"] = "print_date",
        sort_order: Literal["asc", "desc"] = "desc",
    ) -> list[RelationalCheck]:
        where_clauses = []
        params = []

        if date_from:
            where_clauses.append("print_date >= %s")
            params.append(date_from)
        if date_to:
            where_clauses.append("print_date <= %s")
            params.append(date_to)
        if employee_id:
            where_clauses.append("id_employee = %s")
            params.append(employee_id)

        where_clause = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        query_parts = [
            f"SELECT {', '.join(self._fields)}",
            f"FROM {self.table_name}",
            where_clause,
            f"ORDER BY {sort_by} {sort_order}",
        ]

        if limit is not None:
            query_parts.append("LIMIT %s")
            params.append(limit)

        query_parts.append("OFFSET %s")
        params.append(skip)

        query = " ".join(filter(None, query_parts))
        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_by_check_number(self, check_number: str) -> Optional[RelationalCheck]:
        rows = self._db.execute(
            f"""
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            WHERE check_number = %s
            """,
            (check_number,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def get_total_sum_by_period(
        self,
        date_from: date,
        date_to: date,
        employee_id: Optional[str] = None,
    ) -> float:
        where_clause = "WHERE print_date BETWEEN %s AND %s"
        params: list[Any] = [date_from, date_to]

        if employee_id:
            where_clause += " AND id_employee = %s"
            params.append(employee_id)

        row = self._db.execute(
            f"""
            SELECT COALESCE(SUM(sum_total), 0)
            FROM {self.table_name}
            {where_clause}
            """,
            tuple(params),
        )
        return float(row[0][0])

    def create(self, check: RelationalCheck) -> RelationalCheck:
        check_data = check.model_dump()
        rows = self._db.execute(
            f"""
            INSERT INTO {self.table_name} ({", ".join(check_data.keys())})
            VALUES ({", ".join(["%s"] * len(check_data))})
            RETURNING {", ".join(self._fields)}
            """,
            tuple(check_data.values()),
        )
        return self._row_to_model(rows[0])

    def delete(self, check_number: str) -> None:
        self._db.execute(
            f"DELETE FROM {self.table_name} WHERE check_number = %s",
            (check_number,),
        )

    def delete_multiple(self, check_numbers: list[str]) -> None:
        placeholders = ", ".join(["%s"] * len(check_numbers))
        self._db.execute(
            f"DELETE FROM {self.table_name} WHERE check_number IN ({placeholders})",
            tuple(check_numbers),
        )
