from datetime import date, datetime
from typing import Literal, Optional

import structlog

from ..schemas.employee import (
    CreateEmployee,
    Employee,
    EmployeeWorkStatistics,
    UpdateEmployee,
)
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class EmployeeRepository(PydanticDBRepository[Employee]):
    table_name = "employee"
    model = Employee

    def get_all(
        self,
        skip: int = 0,
        limit: Optional[int] = 10,
        search: Optional[str] = None,
        role_filter: Optional[str] = None,
        sort_by: Literal[
            "empl_surname",
            "empl_role",
            "id_employee",
            "salary",
            "date_of_birth",
            "date_of_start",
        ] = "empl_surname",
        sort_order: Literal["asc", "desc"] = "asc",
    ) -> list[Employee]:
        where_clauses = []
        params = []

        if search:
            where_clauses.append("empl_surname ILIKE %s")
            params.append(f"%{search}%")
        if role_filter:
            where_clauses.append("empl_role = %s")
            params.append(role_filter)

        where_clause = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        limit_clause, limit_params = self._build_pagination_clause(skip, limit)
        params.extend(limit_params)

        query = f"""
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            {where_clause}
            ORDER BY {sort_by} {sort_order}
            {limit_clause}
        """

        logger.debug(f"Executing query: {query}")
        logger.debug(f"Parameters: {params}")
        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_by_id(self, id_employee: str) -> Employee | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE id_employee = %s
                """,
            (id_employee,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def create(self, emp: CreateEmployee) -> Employee:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} ({", ".join(self._fields)})
                VALUES ({", ".join(["%s"] * len(self._fields))})
                RETURNING {", ".join(self._fields)}
                """,
            tuple(emp.model_dump().values()),
        )
        return self._row_to_model(rows[0])

    def update(self, id_employee: str, emp: UpdateEmployee) -> Employee:
        set_clause = ", ".join(
            f"{field} = %s" for field in self._fields if field != "id_employee"
        )
        values = [
            getattr(emp, field) for field in self._fields if field != "id_employee"
        ]
        values.append(id_employee)

        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET {set_clause}
                WHERE id_employee = %s
                RETURNING {", ".join(self._fields)}
                """,
            tuple(values),
        )
        return self._row_to_model(rows[0])

    def delete(self, id_employee: str) -> None:
        result = self._db.execute(
            f"DELETE FROM {self.table_name} WHERE id_employee = %s RETURNING id_employee",
            (id_employee,),
        )
        if not result:
            raise Exception(f"Employee with id '{id_employee}' not found")

    def delete_multiple(self, employee_ids: list[str]) -> None:
        if not employee_ids:
            return

        placeholders = ", ".join(["%s"] * len(employee_ids))
        existing_rows = self._db.execute(
            f"""
            SELECT id_employee FROM {self.table_name}
            WHERE id_employee IN ({placeholders})
            """,
            tuple(employee_ids),
        )

        existing_ids = {row[0] for row in existing_rows}

        missing_ids = set(employee_ids) - existing_ids
        if missing_ids:
            raise Exception(f"Some employee IDs do not exist: {', '.join(missing_ids)}")

        self._db.execute(
            f"""
            DELETE FROM {self.table_name}
            WHERE id_employee IN ({placeholders})
            """,
            tuple(employee_ids),
        )

    def get_employee_statistics(self, id_employee: str) -> EmployeeWorkStatistics:
        basic_stats_query = """
            SELECT 
                COUNT(c.check_number) as total_checks,
                COALESCE(SUM(c.sum_total), 0) as total_sales_amount,
                COUNT(DISTINCT c.card_number) as customers_served,
                COUNT(DISTINCT DATE(c.print_date)) as days_worked,
                MAX(DATE(c.print_date)) as most_recent_check_date
            FROM "check" c
            WHERE c.id_employee = %s
        """

        basic_stats_rows = self._db.execute(basic_stats_query, (id_employee,))
        basic_stats = basic_stats_rows[0] if basic_stats_rows else None

        if not basic_stats or basic_stats[0] == 0:
            return EmployeeWorkStatistics(
                total_checks=0,
                total_sales_amount=0.0,
                total_items_sold=0,
                average_check_amount=0.0,
                customers_served=0,
                days_worked=0,
                most_recent_check_date=None,
                most_sold_product_name=None,
                most_sold_product_quantity=0,
            )

        items_sold_query = """
            SELECT COALESCE(SUM(s.product_number), 0) as total_items_sold
            FROM sale s
            INNER JOIN "check" c ON s.check_number = c.check_number
            WHERE c.id_employee = %s
        """

        items_sold_rows = self._db.execute(items_sold_query, (id_employee,))
        total_items_sold = items_sold_rows[0][0] if items_sold_rows else 0

        most_sold_product_query = """
            SELECT 
                p.product_name,
                SUM(s.product_number) as total_quantity
            FROM sale s
            INNER JOIN "check" c ON s.check_number = c.check_number
            INNER JOIN store_product sp ON s.UPC = sp.UPC
            INNER JOIN product p ON sp.id_product = p.id_product
            WHERE c.id_employee = %s
            GROUP BY p.id_product, p.product_name
            ORDER BY total_quantity DESC
            LIMIT 1
        """

        most_sold_rows = self._db.execute(most_sold_product_query, (id_employee,))
        most_sold_product_name = None
        most_sold_product_quantity = 0

        if most_sold_rows:
            most_sold_product_name = most_sold_rows[0][0]
            most_sold_product_quantity = most_sold_rows[0][1]

        total_checks = basic_stats[0]
        total_sales_amount = float(basic_stats[1])
        average_check_amount = (
            total_sales_amount / total_checks if total_checks > 0 else 0.0
        )

        most_recent_check_date = None
        if basic_stats[4]:
            if isinstance(basic_stats[4], datetime):
                most_recent_check_date = basic_stats[4].date()
            elif isinstance(basic_stats[4], date):
                most_recent_check_date = basic_stats[4]

        return EmployeeWorkStatistics(
            total_checks=total_checks,
            total_sales_amount=total_sales_amount,
            total_items_sold=total_items_sold,
            average_check_amount=average_check_amount,
            customers_served=basic_stats[2] or 0,
            days_worked=basic_stats[3] or 0,
            most_recent_check_date=most_recent_check_date,
            most_sold_product_name=most_sold_product_name,
            most_sold_product_quantity=most_sold_product_quantity,
        )

    def get_employees_only_with_promotional_sales(self) -> list[Employee]:
        fields = ",".join(self._fields)
        role = "cashier"

        query = f"""
        SELECT 
            {fields}
        FROM employee e
        WHERE NOT EXISTS (
            SELECT sp_outer.id_product AS id_product
            FROM 
                (store_product sp_outer INNER JOIN sale ON sp_outer.UPC = sale.UPC)
                INNER JOIN "check" c ON sale.check_number = c.check_number
            WHERE NOT EXISTS (
                SELECT sp_inner.id_product
                FROM store_product AS sp_inner
                WHERE sp_inner.UPC_prom IS NOT NULL AND sp_outer.UPC = sp_inner.UPC_prom 
            ) AND sp_outer.UPC_prom IS NULL AND c.id_employee = e.id_employee
        ) AND e.empl_role = %s
        """
        rows = self._db.execute(query, (role,))
        return [self._row_to_model(row) for row in rows]
