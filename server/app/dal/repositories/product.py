from typing import Literal, Optional

import structlog

from ...db.connection._base import IDatabase
from ..schemas.product import CreateProduct, Product, UpdateProduct
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class ProductRepository(PydanticDBRepository[Product]):
    table_name = "product"
    model = Product

    def __init__(self, db: IDatabase):
        self._db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Literal[
            "id_product", "product_name", "category_number"
        ] = "id_product",
        sort_order: Literal["asc", "desc"] = "asc",
        category_number: Optional[int] = None,
    ) -> list[Product]:
        where_clauses = []
        params = []

        if search:
            where_clauses.append("product_name ILIKE %s")
            params.append(f"%{search}%")

        if category_number is not None:
            where_clauses.append("category_number = %s")
            params.append(category_number)

        where_clause = ""
        if where_clauses:
            where_clause = "WHERE " + " AND ".join(where_clauses)

        query = f"""
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            {where_clause}
            ORDER BY {sort_by} {sort_order.upper()}
            LIMIT %s OFFSET %s
        """

        params.extend([limit, skip])

        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_total_count(
        self, search: Optional[str] = None, category_number: Optional[int] = None
    ) -> int:
        where_clauses = []
        params = []

        if search:
            where_clauses.append("product_name ILIKE %s")
            params.append(f"%{search}%")

        if category_number is not None:
            where_clauses.append("category_number = %s")
            params.append(category_number)

        where_clause = ""
        if where_clauses:
            where_clause = "WHERE " + " AND ".join(where_clauses)

        query = f"""
            SELECT COUNT(*)
            FROM {self.table_name}
            {where_clause}
        """

        rows = self._db.execute(query, tuple(params))
        return rows[0][0] if rows else 0

    def get_by_id(self, id_product: int) -> Product | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE id_product = %s
            """,
            (id_product,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def create(self, create_product: CreateProduct) -> Product:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (category_number, product_name, characteristics)
                VALUES (%s, %s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (
                create_product.category_number,
                create_product.product_name,
                create_product.characteristics,
            ),
        )
        return self._row_to_model(rows[0])

    def update(
        self,
        id_product: int,
        update_product: UpdateProduct,
    ) -> Product:
        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET category_number = %s, product_name = %s, characteristics = %s
                WHERE id_product = %s
                RETURNING {", ".join(self._fields)}
            """,
            (
                update_product.category_number,
                update_product.product_name,
                update_product.characteristics,
                id_product,
            ),
        )
        return self._row_to_model(rows[0])

    def delete(self, id_product: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE id_product = %s
            """,
            (id_product,),
        )

    def delete_multiple(self, product_ids: list[int]) -> None:
        if not product_ids:
            return

        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE id_product IN ({", ".join(["%s"] * len(product_ids))})
            """,
            tuple(product_ids),
        )
