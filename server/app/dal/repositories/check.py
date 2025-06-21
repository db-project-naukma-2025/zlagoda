from datetime import date
from typing import Any, Dict, Literal, Optional

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
        product_upc: Optional[str] = None,
        sort_by: Literal["check_number", "print_date", "sum_total"] = "print_date",
        sort_order: Literal["asc", "desc"] = "desc",
    ) -> list[RelationalCheck]:
        where_clauses = []
        params = []
        joins = []

        if date_from:
            where_clauses.append("c.print_date >= %s")
            params.append(date_from)
        if date_to:
            where_clauses.append("c.print_date < %s + INTERVAL '1 day'")
            params.append(date_to)
        if employee_id:
            where_clauses.append("c.id_employee = %s")
            params.append(employee_id)
        if product_upc:
            joins.append("INNER JOIN sale s ON c.check_number = s.check_number")
            where_clauses.append("s.UPC = %s")
            params.append(product_upc)

        from_clause = f"FROM {self.table_name} c"
        if joins:
            from_clause += f" {' '.join(joins)}"

        where_clause = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        select_clause = (
            f"SELECT DISTINCT {', '.join([f'c.{field}' for field in self._fields])}"
        )

        query_parts = [
            select_clause,
            from_clause,
            where_clause,
            f"ORDER BY c.{sort_by} {sort_order}",
        ]

        limit_clause, limit_params = self._build_pagination_clause(skip, limit)
        if limit_clause:
            query_parts.append(limit_clause)
        params.extend(limit_params)

        query = " ".join(filter(None, query_parts))
        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_metadata_stats(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        employee_id: Optional[str] = None,
        product_upc: Optional[str] = None,
    ) -> Dict[str, Any]:
        where_clauses = []
        params = []
        joins = []

        if date_from:
            where_clauses.append("c.print_date >= %s")
            params.append(date_from)
        if date_to:
            where_clauses.append("c.print_date < %s + INTERVAL '1 day'")
            params.append(date_to)
        if employee_id:
            where_clauses.append("c.id_employee = %s")
            params.append(employee_id)
        if product_upc:
            joins.append("INNER JOIN sale s ON c.check_number = s.check_number")
            where_clauses.append("s.UPC = %s")
            params.append(product_upc)

        from_clause = f"FROM {self.table_name} c"
        if joins:
            from_clause += f" {' '.join(joins)}"

        where_clause = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        count_query = f"""
            SELECT COUNT(DISTINCT c.check_number) as checks_count,
                   COALESCE(SUM(DISTINCT c.sum_total), 0) as total_sum,
                   COALESCE(SUM(DISTINCT c.vat), 0) as total_vat
            {from_clause}
            {where_clause}
        """

        count_result = self._db.execute(count_query, tuple(params))
        checks_count = count_result[0][0] if count_result else 0
        total_sum = float(count_result[0][1]) if count_result else 0.0
        total_vat = float(count_result[0][2]) if count_result else 0.0

        items_query = f"""
            SELECT COALESCE(SUM(s.product_number), 0) as total_items,
                   COUNT(DISTINCT s.UPC) as total_product_types
            FROM sale s
            INNER JOIN {self.table_name} c ON s.check_number = c.check_number
            {where_clause}
        """

        items_result = self._db.execute(items_query, tuple(params))
        total_items_count = int(items_result[0][0]) if items_result else 0
        total_product_types = int(items_result[0][1]) if items_result else 0

        return {
            "checks_count": checks_count,
            "total_sum": total_sum,
            "total_vat": total_vat,
            "total_items_count": total_items_count,
            "total_product_types": total_product_types,
        }

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
