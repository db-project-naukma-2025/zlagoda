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
        """
        Create a new customer card record in the database using the provided data.
        
        Only fields set in the `customer_card` object are included in the insert operation. Returns the created `CustomerCard` instance.
        """
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
        """
        Delete a customer card record identified by its card number.
        
        Parameters:
            card_number (str): The unique card number of the customer card to delete.
        """
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
        """
        Builds SQL clause strings and parameter values from the non-unset fields of a CustomerCardUpdate object.
        
        Parameters:
            fields (list[str]): List of field names to consider for clause construction.
            customer_card (CustomerCardUpdate | None): Update object containing potential filter or update values.
        
        Returns:
            tuple[list[str], list[Any]]: A tuple containing the list of SQL clause strings and their corresponding parameter values.
        """
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
        """
        Update fields of a customer card identified by its card number and return the updated record.
        
        Parameters:
            card_number (str): The unique card number of the customer card to update.
            customer_card (CustomerCardUpdate): An object containing the fields to update.
        
        Returns:
            CustomerCard: The updated customer card record.
        
        Raises:
            ValueError: If no fields are provided to update.
        """
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
        """
        Return the total number of customer card records matching the specified filter criteria.
        
        Parameters:
        	customer_card (CustomerCardUpdate, optional): An object specifying fields to filter the count query. Only set fields are used as filters.
        
        Returns:
        	int: The count of customer card records that match the provided filters.
        """
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
        """
        Retrieve a list of customer cards matching optional filter criteria, with support for sorting, pagination, and field-based ordering.
        
        Parameters:
            customer_card (CustomerCardUpdate, optional): Filter criteria; only set fields are used for filtering.
            order_by (str, optional): Field name to order results by. Must be a valid model field.
            sort_order (Literal["asc", "desc"], optional): Sort direction for ordering. Defaults to "desc".
            limit (int, optional): Maximum number of records to return.
            offset (int, optional): Number of records to skip before returning results.
        
        Returns:
            list[CustomerCard]: List of customer cards matching the specified criteria.
        """
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
        """
        Retrieve a customer card record by its card number.
        
        Parameters:
        	card_number (str): The unique card number identifying the customer card.
        
        Returns:
        	CustomerCard: The customer card record matching the provided card number.
        """
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE card_number = %s
            """,
            (card_number,),
        )
        return self._row_to_model(rows[0])
