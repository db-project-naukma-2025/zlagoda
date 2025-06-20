from typing import Iterable, List

import structlog

from ..schemas.sale import Sale
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class SaleRepository(PydanticDBRepository[Sale]):
    table_name = "sale"
    model = Sale

    def get_by_check(self, check_number: str) -> List[Sale]:
        rows = self._db.execute(
            f"""
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            WHERE check_number = %s
            """,
            (check_number,),
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, sale: Sale) -> Sale:
        rows = self._db.execute(
            f"""
            INSERT INTO {self.table_name} ({", ".join(self._fields)})
            VALUES ({", ".join(["%s"] * len(self._fields))})
            RETURNING {", ".join(self._fields)}
            """,
            tuple(sale.model_dump().values()),
        )
        return self._row_to_model(rows[0])

    def create_multiple(self, sales: Iterable[Sale]) -> List[Sale]:
        if not sales:
            return []

        values_placeholders = []
        params = []
        for sale in sales:
            values_placeholders.append(f"({', '.join(['%s'] * len(self._fields))})")
            params.extend(list(sale.model_dump().values()))

        query = f"""
            INSERT INTO {self.table_name} ({", ".join(self._fields)})
            VALUES {", ".join(values_placeholders)}
            RETURNING {", ".join(self._fields)}
        """

        rows = self._db.execute(query, tuple(params))
        return [self._row_to_model(row) for row in rows]

    def get_by_product(self, UPC: str) -> List[Sale]:
        rows = self._db.execute(
            f"""
            SELECT {", ".join(self._fields)}
            FROM {self.table_name}
            WHERE UPC = %s
            """,
            (UPC,),
        )
        return [self._row_to_model(row) for row in rows]
