from typing import Any, Literal

import structlog

from ..schemas._base import UNSET
from ..schemas.customer_card import CustomerCard, CustomerCardCreate, CustomerCardUpdate
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class CustomerCardRepository(PydanticDBRepository[CustomerCard]):
    table_name = "customer_card"
    model = CustomerCard

    def create(
        self,
        customer_card: CustomerCardCreate,
    ) -> CustomerCard:
        fields = list(self._fields)

        params = []
        for field in fields:
            value = getattr(customer_card, field, UNSET)
            if value is UNSET:
                continue
            params.append(value)

        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} ({", ".join(fields)})
                VALUES ({", ".join(["%s" for _ in fields])})
                RETURNING {", ".join(self._fields)}
            """,
            tuple(params),
        )
        return self._row_to_model(rows[0])

    def delete(
        self,
        card_number: str,
    ) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE card_number = %s
            """,
            (card_number,),
        )

    def _construct_clauses(
        self, fields: list[str], customer_card: CustomerCardUpdate | None = None
    ) -> tuple[list[str], list[Any]]:
        clauses, params = [], []
        if customer_card is not None:
            filter_values = {}
            for field in fields:
                value = getattr(customer_card, field, UNSET)
                if value is UNSET:
                    continue
                filter_values[field] = value

            for field, value in filter_values.items():
                clauses.append(f"{field} = %s")
                params.append(value)

        return clauses, params

    def update(
        self,
        card_number: str,
        customer_card: CustomerCardUpdate,
    ) -> CustomerCard:
        fields = list(self._fields)

        set_clauses, params = self._construct_clauses(fields, customer_card)

        if not set_clauses:
            raise ValueError("No fields to update")

        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET {", ".join(set_clauses)}
                WHERE card_number = %s
                RETURNING {", ".join(fields)}
            """,
            tuple(params + [card_number]),
        )
        return self._row_to_model(rows[0])

    def get_total_count(self, customer_card: CustomerCardUpdate | None = None) -> int:
        fields = list(self._fields)

        where_clauses, params = self._construct_clauses(fields, customer_card)

        rows = self._db.execute(
            f"""
                SELECT COUNT(*) FROM {self.table_name}
                {"WHERE " + " AND ".join(where_clauses) if where_clauses else ""}
            """,
            tuple(params),
        )
        return rows[0][0]

    def search(
        self,
        customer_card: CustomerCardUpdate | None = None,
        /,
        *,
        order_by: str | None = None,
        sort_order: Literal["asc", "desc"] = "desc",
        limit: int | None = None,
        offset: int | None = None,
    ) -> list[CustomerCard]:
        fields = list(self._fields)
        if order_by is not None and order_by not in fields:
            raise ValueError(f"Invalid order_by: {order_by}")

        if sort_order not in ["asc", "desc"]:
            raise ValueError(f"Invalid sort_order: {sort_order}")

        where_clauses, params = self._construct_clauses(fields, customer_card)

        query = f""" SELECT {", ".join(fields)} FROM {self.table_name}"""
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        extra_params = []
        if order_by:
            # * We can't use %s here because we need to use the field name directly.
            # * We have checked that order_by is in fields, so we can safely use it here.
            query += f" ORDER BY {order_by} {sort_order}"
        if limit:
            query += " LIMIT %s"
            extra_params.append(limit)
        if offset:
            query += " OFFSET %s"
            extra_params.append(offset)

        rows = self._db.execute(query, tuple(params + extra_params))
        return [self._row_to_model(row) for row in rows]

    def get(
        self,
        card_number: str,
    ) -> CustomerCard:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE card_number = %s
            """,
            (card_number,),
        )
        return self._row_to_model(rows[0])
