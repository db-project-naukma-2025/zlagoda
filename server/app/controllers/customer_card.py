from abc import ABC
from typing import Literal, TypedDict

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
        "order_by": "cust_surname",
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

    def by_percentage(
        self,
        discount_percent: int,
        *,
        limit: int | None = None,
        offset: int | None = None,
    ) -> tuple[list[CustomerCard], int]:
        cards = self.repo.search(
            CustomerCardUpdate(percent=discount_percent),
            limit=limit,
            offset=offset,
            **self.DEFAULT_ORDERING,
        )
        total = self.repo.get_total_count(CustomerCardUpdate(percent=discount_percent))
        return cards, total

    def by_surname(
        self, surname: str, *, limit: int | None = None, offset: int | None = None
    ) -> tuple[list[CustomerCard], int]:
        cards = self.repo.search(
            CustomerCardUpdate(cust_surname=surname),
            limit=limit,
            offset=offset,
            **self.DEFAULT_ORDERING,
        )
        total = self.repo.get_total_count(CustomerCardUpdate(cust_surname=surname))
        return cards, total


class CustomerCardModificationController(BaseCustomerCardController):
    def create(self, data: CustomerCardCreate) -> CustomerCard:
        return self.repo.create(data)

    def update(self, card_number: str, data: CustomerCardUpdate) -> CustomerCard:
        return self.repo.update(card_number, data)

    def delete(self, card_number: str) -> None:
        self.repo.delete(card_number)
