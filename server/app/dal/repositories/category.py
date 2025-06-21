from datetime import date
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

    def get_category_revenue_report(
        self, date_from: Optional[date] = None, date_to: Optional[date] = None
    ) -> list[dict]:
        """Get revenue report for categories within a date range. If no dates provided, shows all time."""
        date_filter = ""
        params = []

        if date_from and date_to:
            date_filter = 'AND "check".print_date BETWEEN %s AND %s'
            params = [date_from, date_to, date_from, date_to]
        elif date_from:
            date_filter = 'AND "check".print_date >= %s'
            params = [date_from, date_from]
        elif date_to:
            date_filter = 'AND "check".print_date <= %s'
            params = [date_to, date_to]

        query = f"""
            SELECT Category.category_number,
                   Category.category_name,
                   SUM(Sale.product_number) AS total_amount,
                   SUM(Sale.product_number * Sale.selling_price) AS total_revenue
            FROM (Category
                  INNER JOIN Product ON Category.category_number = Product.category_number)
            INNER JOIN (Store_Product
                        INNER JOIN Sale ON Store_Product.UPC = Sale.UPC) ON Product.id_product = Store_Product.id_product
            INNER JOIN "check" ON Sale.check_number = "check".check_number
            WHERE 1=1 {date_filter}
            GROUP BY Category.category_number, Category.category_name
            UNION ALL
            -- Add categories with 0 sales/revenue where they have no sales in the period (or no sales at all)
            SELECT Category.category_number,
                   Category.category_name,
                   0 AS total_amount,
                   0 AS total_revenue
            FROM Category
            WHERE NOT EXISTS
                (SELECT 1
                 FROM (Product
                       INNER JOIN Store_Product ON Product.id_product = Store_Product.id_product)
                 INNER JOIN Sale ON Store_Product.UPC = Sale.UPC
                 INNER JOIN "check" ON Sale.check_number = "check".check_number
                 WHERE Product.category_number = Category.category_number
                   {date_filter})
            ORDER BY total_revenue DESC
        """

        rows = self._db.execute(query, tuple(params))
        return [
            {
                "category_number": row[0],
                "category_name": row[1],
                "total_amount": int(row[2]) if row[2] is not None else 0,
                "total_revenue": float(row[3]) if row[3] is not None else 0.0,
            }
            for row in rows
        ]

    def get_categories_with_all_products_sold(self) -> list[dict]:
        """Get categories where all products have been sold at least once."""
        query = """
            SELECT Category.category_number,
                   Category.category_name
            FROM Category
            WHERE EXISTS
               -- There is at least one product in the category (otherwise, exclude it)
                (SELECT *
                 FROM Product
                 WHERE Product.category_number = Category.category_number)
              -- And there is no product without a sale
              AND NOT EXISTS
                (SELECT *
                 FROM Product
                 WHERE Product.category_number = Category.category_number
                   AND NOT EXISTS
                     (SELECT *
                      FROM Store_Product
                      INNER JOIN Sale ON Store_Product.UPC = Sale.UPC
                      WHERE Store_Product.id_product = Product.id_product))
            ORDER BY Category.category_number
        """

        rows = self._db.execute(query, ())
        return [
            {
                "category_number": row[0],
                "category_name": row[1],
            }
            for row in rows
        ]
