from abc import ABC
from datetime import date
from typing import Any, Literal, TypedDict

from ..dal.repositories.customer_card import CustomerCardRepository
from ..dal.schemas.customer_card import (
    CustomerCard,
    CustomerCardCreate,
    CustomerCardUpdate,
)


class BaseCustomerCardController(ABC):
    def __init__(self, repo: CustomerCardRepository):
        self.repo = repo


class CustomerCardQueryController(BaseCustomerCardController):
    class _DefaultOrdering(TypedDict):
        order_by: str
        sort_order: Literal["asc", "desc"]

    DEFAULT_ORDERING: _DefaultOrdering = {
        "order_by": "card_number",
        "sort_order": "desc",
    }

    def get_customer_card(self, card_number: str) -> CustomerCard:
        return self.repo.get(card_number)

    def get_all(
        self, *, limit: int | None = None, offset: int | None = None
    ) -> tuple[list[CustomerCard], int]:
        cards = self.repo.search(limit=limit, offset=offset, **self.DEFAULT_ORDERING)
        total = self.repo.get_total_count()
        return cards, total

    def search(
        self,
        cust_surname: str | None = None,
        percent: int | None = None,
        *,
        order_by: str | None = None,
        sort_order: Literal["asc", "desc"] | None = None,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[list[CustomerCard], int]:
        search_params = CustomerCardUpdate()
        if cust_surname:
            search_params.cust_surname = cust_surname
        if percent:
            search_params.percent = percent

        cards = self.repo.search(
            search_params,
            order_by=order_by or self.DEFAULT_ORDERING["order_by"],
            sort_order=sort_order or self.DEFAULT_ORDERING["sort_order"],
            limit=limit,
            offset=offset,
        )
        total = self.repo.get_total_count(search_params)
        return cards, total

    def get_card_sold_categories(
        self,
        *,
        card_number: str | None = None,
        category_name: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[dict[str, Any]]:
        return self.repo.get_card_sold_categories(
            card_number=card_number,
            category_name=category_name,
            start_date=start_date,
            end_date=end_date,
        )


class CustomerCardModificationController(BaseCustomerCardController):
    def create(self, data: CustomerCardCreate) -> CustomerCard:
        return self.repo.create(data)

    def update(self, card_number: str, data: CustomerCardUpdate) -> CustomerCard:
        return self.repo.update(card_number, data)

    def delete(self, card_number: str) -> None:
        self.repo.delete(card_number)

    def delete_multiple(self, card_numbers: list[str]) -> None:
        self.repo.delete_multiple(card_numbers)
