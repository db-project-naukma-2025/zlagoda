from datetime import date
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
        
    def delete_multiple(self, card_numbers: list[str]) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE card_number IN %s
            """,
            (card_numbers,),
        )

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

        if order_by:
            # * We can't use %s here because we need to use the field name directly.
            # * We have checked that order_by is in fields, so we can safely use it here.
            query += f" ORDER BY {order_by} {sort_order}"

        limit_clause, extra_params = self._build_pagination_clause(offset or 0, limit)
        if limit_clause:
            query += f" {limit_clause}"

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
        if not rows:
            raise ValueError(f"Customer card with card_number {card_number} not found")
        return self._row_to_model(rows[0])

    def get_card_sold_categories(
        self,
        *,
        card_number: str | None = None,
        category_name: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        date_filter = ""
        params: list[Any] = []

        if start_date and end_date:
            date_filter = 'AND "check".print_date BETWEEN %s AND %s'
            params = [start_date, end_date, start_date, end_date]
        elif start_date:
            date_filter = 'AND "check".print_date >= %s'
            params = [start_date, start_date]
        elif end_date:
            date_filter = 'AND "check".print_date <= %s'
            params = [end_date, end_date]

        having_clauses, params = [], []
        if category_name:
            having_clauses.append("cat.category_name = %s")
            params.append(category_name)
        if card_number:
            having_clauses.append("cc.card_number = %s")
            params.append(card_number)

        query = f"""
        SELECT 
            cc.card_number AS card_number, 
            cc.cust_surname || ' ' || cc.cust_name as customer_name, 
            cat.category_name AS category_name,
            SUM(s.product_number) AS total_products,
            SUM(s.product_number * s.selling_price) as total_revenue
        FROM customer_card cc 
            INNER JOIN "check" c ON cc.card_number = c.card_number
            INNER JOIN sale s ON c.check_number = s.check_number
            INNER JOIN store_product sp ON s.upc = sp.upc
            INNER JOIN product p ON sp.id_product = p.id_product
            INNER JOIN category cat ON p.category_number = cat.category_number
        WHERE 1=1 {date_filter}
        GROUP BY (cc.card_number, cc.cust_surname, cc.cust_name, cat.category_name)    
        """
        if having_clauses:
            query += " HAVING " + " AND ".join(having_clauses)

        rows = self._db.execute(query, tuple(params))
        return [
            {
                "card_number": row[0],
                "customer_name": row[1],
                "category_name": row[2],
                "total_products": row[3],
                "total_revenue": row[4],
            }
            for row in rows
        ]
