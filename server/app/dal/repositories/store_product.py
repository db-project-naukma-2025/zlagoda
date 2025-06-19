from typing import Literal, Optional

import structlog

from ...db.connection._base import IDatabase
from ..schemas.store_product import CreateStoreProduct, StoreProduct, UpdateStoreProduct
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class StoreProductRepository(PydanticDBRepository[StoreProduct]):
    table_name = "store_product"
    model = StoreProduct

    def __init__(self, db: IDatabase):
        self._db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Literal[
            "UPC",
            "selling_price",
            "products_number",
            "promotional_product",
            "UPC_prom",
        ] = "UPC",
        sort_order: Literal["asc", "desc"] = "asc",
        promotional_only: Optional[bool] = None,
        id_product: Optional[int] = None,
    ) -> list[StoreProduct]:
        where_clauses = []
        params = []

        if search:
            search_conditions = [
                "sp.UPC ILIKE %s",
                "p.product_name ILIKE %s",
                "c.category_name ILIKE %s",
                "sp.UPC_prom ILIKE %s",
            ]
            where_clauses.append(f"({' OR '.join(search_conditions)})")
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param, search_param])

        if promotional_only is not None:
            where_clauses.append("sp.promotional_product = %s")
            params.append(promotional_only)

        if id_product is not None:
            where_clauses.append("sp.id_product = %s")
            params.append(id_product)

        where_clause = ""
        if where_clauses:
            where_clause = "WHERE " + " AND ".join(where_clauses)

        query = f"""
            SELECT {", ".join([f"sp.{field}" for field in self._fields])}
            FROM {self.table_name} sp
            LEFT JOIN product p ON sp.id_product = p.id_product
            LEFT JOIN category c ON p.category_number = c.category_number
            {where_clause}
            ORDER BY sp.{sort_by} {sort_order.upper()}
            LIMIT %s OFFSET %s
        """

        params.extend([limit, skip])

        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_total_count(
        self,
        search: Optional[str] = None,
        promotional_only: Optional[bool] = None,
        id_product: Optional[int] = None,
    ) -> int:
        where_clauses = []
        params = []

        if search:
            search_conditions = [
                "sp.UPC ILIKE %s",
                "p.product_name ILIKE %s",
                "c.category_name ILIKE %s",
            ]
            where_clauses.append(f"({' OR '.join(search_conditions)})")
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])

        if promotional_only is not None:
            where_clauses.append("sp.promotional_product = %s")
            params.append(promotional_only)

        if id_product is not None:
            where_clauses.append("sp.id_product = %s")
            params.append(id_product)

        where_clause = ""
        if where_clauses:
            where_clause = "WHERE " + " AND ".join(where_clauses)

        query = f"""
            SELECT COUNT(*)
            FROM {self.table_name} sp
            LEFT JOIN product p ON sp.id_product = p.id_product
            LEFT JOIN category c ON p.category_number = c.category_number
            {where_clause}
        """

        rows = self._db.execute(query, tuple(params))
        return rows[0][0] if rows else 0

    def get_by_upc(self, upc: str) -> StoreProduct | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE UPC = %s
            """,
            (upc,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def get_regular_product_for_product_id(
        self, id_product: int
    ) -> StoreProduct | None:
        """Get the regular (non-promotional) store product for a given product ID."""
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE id_product = %s AND promotional_product = false
            """,
            (id_product,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def get_promotional_product_for_product_id(
        self, id_product: int
    ) -> StoreProduct | None:
        """Get the promotional store product for a given product ID."""
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE id_product = %s AND promotional_product = true
            """,
            (id_product,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def create(
        self,
        create_store_product: CreateStoreProduct,
    ) -> StoreProduct:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (UPC, UPC_prom, id_product, selling_price, products_number, promotional_product)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (
                create_store_product.UPC,
                create_store_product.UPC_prom,
                create_store_product.id_product,
                create_store_product.selling_price,
                create_store_product.products_number,
                create_store_product.promotional_product,
            ),
        )
        return self._row_to_model(rows[0])

    def update(
        self,
        upc: str,
        update_store_product: UpdateStoreProduct,
    ) -> StoreProduct:
        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET UPC_prom = %s, id_product = %s, selling_price = %s, products_number = %s, promotional_product = %s
                WHERE UPC = %s
                RETURNING {", ".join(self._fields)}
            """,
            (
                update_store_product.UPC_prom,
                update_store_product.id_product,
                update_store_product.selling_price,
                update_store_product.products_number,
                update_store_product.promotional_product,
                upc,
            ),
        )
        return self._row_to_model(rows[0])

    def delete(self, upc: str) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE UPC = %s
            """,
            (upc,),
        )

    def delete_multiple(self, upcs: list[str]) -> None:
        if not upcs:
            return

        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE UPC = ANY(%s)
            """,
            (upcs,),
        )

    def exists_for_product_and_promo_type(
        self,
        id_product: int,
        promotional_product: bool,
        exclude_upc: Optional[str] = None,
    ) -> bool:
        """Check if a store product already exists for given product ID and promotional type."""
        where_clause = "WHERE id_product = %s AND promotional_product = %s"
        params: list[str | int | bool] = [id_product, promotional_product]

        if exclude_upc:
            where_clause += " AND UPC != %s"
            params.append(exclude_upc)

        query = f"""
            SELECT COUNT(*)
            FROM {self.table_name}
            {where_clause}
        """

        rows = self._db.execute(query, tuple(params))
        count = rows[0][0] if rows else 0
        return count > 0
