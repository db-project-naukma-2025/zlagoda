from typing import Literal, Optional

import structlog

from ..schemas.employee import CreateEmployee, Employee, UpdateEmployee
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class EmployeeRepository(PydanticDBRepository[Employee]):
    table_name = "employee"
    model = Employee

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
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
