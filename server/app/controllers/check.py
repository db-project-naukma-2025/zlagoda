from abc import ABC
from datetime import date
from typing import Literal, Optional, TypedDict

from ..dal.repositories.check import CheckRepository
from ..dal.repositories.customer_card import CustomerCardRepository
from ..dal.repositories.sale import SaleRepository
from ..dal.repositories.store_product import StoreProductRepository
from ..dal.schemas.check import Check, CreateCheck, RelationalCheck
from ..dal.schemas.sale import Sale, SaleWithPrice
from ..db.connection import transaction


class BaseCheckController(ABC):
    def __init__(
        self,
        repo: CheckRepository,
        customer_card_repo: CustomerCardRepository,
        store_product_repo: StoreProductRepository,
        sale_repo: SaleRepository,
    ):
        self.repo = repo
        self.customer_card_repo = customer_card_repo
        self.store_product_repo = store_product_repo
        self.sale_repo = sale_repo


class CheckQueryController(BaseCheckController):
    class _DefaultOrdering(TypedDict):
        sort_by: Literal["print_date", "sum_total"]
        sort_order: Literal["asc", "desc"]

    DEFAULT_ORDERING: _DefaultOrdering = {
        "sort_by": "print_date",
        "sort_order": "desc",
    }

    def get_check(self, check_number: str) -> Check:
        relational_check = self.repo.get_by_check_number(check_number)
        if not relational_check:
            raise ValueError(f"Check with number {check_number} not found")

        sales = self.sale_repo.get_by_check(check_number)
        return Check(**relational_check.model_dump(), sales=sales)

    def get_all(
        self,
        *,
        skip: int = 0,
        limit: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        employee_id: Optional[str] = None,
    ) -> list[Check]:
        relational_checks = self.repo.get_all(
            skip=skip,
            limit=limit,
            date_from=date_from,
            date_to=date_to,
            employee_id=employee_id,
            sort_by=self.DEFAULT_ORDERING["sort_by"],
            sort_order=self.DEFAULT_ORDERING["sort_order"],
        )

        checks = []
        for relational_check in relational_checks:
            sales = self.sale_repo.get_by_check(relational_check.check_number)
            check = Check(**relational_check.model_dump(), sales=sales)
            checks.append(check)

        return checks


class CheckModificationController(BaseCheckController):
    def create(self, data: CreateCheck) -> Check:
        sales_with_prices, final_total, vat = self._prepare_sales_and_calculate_totals(
            data
        )

        relational_check = RelationalCheck(
            check_number=data.check_number,
            id_employee=data.id_employee,
            card_number=data.card_number,
            print_date=data.print_date,
            sum_total=float(final_total),
            vat=float(vat),
        )

        with transaction(self.repo._db):
            created_relational_check = self.repo.create(relational_check)

            sales = []
            for sale_with_price in sales_with_prices:
                sales.append(
                    Sale(
                        UPC=sale_with_price.UPC,
                        product_number=sale_with_price.product_number,
                        selling_price=sale_with_price.selling_price,
                        check_number=created_relational_check.check_number,
                    )
                )

            created_sales = self.sale_repo.create_multiple(sales)

            # reduce inventory for each product
            for sale_with_price in sales_with_prices:
                self.store_product_repo.reduce_inventory(
                    sale_with_price.UPC, sale_with_price.product_number
                )

        return Check(**created_relational_check.model_dump(), sales=created_sales)

    def _prepare_sales_and_calculate_totals(
        self, data: CreateCheck
    ) -> tuple[list[SaleWithPrice], float, float]:
        self._validate_sales_data(data.sales)

        sales_with_prices = self._create_sales_with_prices(data.sales)

        base_total = self._calculate_base_total(sales_with_prices)
        final_total = self._apply_customer_discount(base_total, data.card_number)
        vat = self._calculate_vat(final_total)

        return sales_with_prices, final_total, vat

    def _validate_sales_data(self, sales_data) -> None:
        for sale_data in sales_data:
            store_product = self.store_product_repo.get_by_upc(sale_data.UPC)
            if not store_product:
                raise ValueError(f"Product with UPC {sale_data.UPC} not found")

            if store_product.products_number < sale_data.product_number:
                raise ValueError(
                    f"Insufficient stock for UPC {sale_data.UPC}. "
                    f"Available: {store_product.products_number}, "
                    f"Requested: {sale_data.product_number}"
                )

    def _create_sales_with_prices(self, sales_data) -> list[SaleWithPrice]:
        sales_with_prices = []

        for sale_data in sales_data:
            store_product = self.store_product_repo.get_by_upc(sale_data.UPC)
            if not store_product:
                raise ValueError(f"Product with UPC {sale_data.UPC} not found")

            sale_with_price = SaleWithPrice(
                UPC=sale_data.UPC,
                product_number=sale_data.product_number,
                selling_price=store_product.selling_price,
            )
            sales_with_prices.append(sale_with_price)

        return sales_with_prices

    def _calculate_base_total(self, sales_with_prices: list[SaleWithPrice]) -> float:
        total_sum = 0.0

        for sale in sales_with_prices:
            line_total = sale.selling_price * sale.product_number
            total_sum += line_total

        return total_sum

    def _apply_customer_discount(
        self, base_total: float, card_number: Optional[str]
    ) -> float:
        if not card_number:
            return base_total

        customer_card = self.customer_card_repo.get(card_number)
        if not customer_card:
            raise ValueError(f"Customer card {card_number} not found")

        discount_multiplier = 1 - (customer_card.percent / 100)
        return base_total * discount_multiplier

    def _calculate_vat(self, total: float) -> float:
        return total * 0.2


class CheckCleanupController(BaseCheckController):
    def delete_all_checks(self) -> None:
        all_checks = self.repo.get_all(limit=None)

        if not all_checks:
            return None

        check_numbers = [check.check_number for check in all_checks]
        self.repo.delete_multiple(check_numbers)
