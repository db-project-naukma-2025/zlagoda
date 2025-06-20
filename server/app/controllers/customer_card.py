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
        """
        Initialize the controller with a customer card repository instance.
        """
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
        """
        Retrieve a customer card by its card number.
        
        Parameters:
            card_number (str): The unique identifier of the customer card.
        
        Returns:
            CustomerCard: The customer card associated with the given card number.
        """
        return self.repo.get(card_number)

    def get_all(
        self, *, limit: int | None = None, offset: int | None = None
    ) -> tuple[list[CustomerCard], int]:
        """
        Retrieve all customer cards with optional pagination and default ordering.
        
        Parameters:
            limit (int, optional): Maximum number of customer cards to return.
            offset (int, optional): Number of customer cards to skip before starting to collect the result set.
        
        Returns:
            tuple[list[CustomerCard], int]: A tuple containing the list of customer cards and the total count of cards.
        """
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
        """
        Retrieve customer cards with a specific discount percentage, applying optional pagination and default ordering.
        
        Parameters:
            discount_percent (int): The discount percentage to filter customer cards by.
            limit (int, optional): Maximum number of cards to return.
            offset (int, optional): Number of cards to skip before starting to collect the result set.
        
        Returns:
            tuple[list[CustomerCard], int]: A tuple containing the list of matching customer cards and the total count.
        """
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
        """
        Retrieve customer cards matching a given surname, with optional pagination and default ordering.
        
        Parameters:
            surname (str): The surname to filter customer cards by.
            limit (int, optional): Maximum number of records to return.
            offset (int, optional): Number of records to skip before starting to collect the result set.
        
        Returns:
            tuple[list[CustomerCard], int]: A tuple containing the list of matching customer cards and the total count of cards with the specified surname.
        """
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
        """
        Create a new customer card with the provided data.
        
        Parameters:
            data (CustomerCardCreate): The information required to create a new customer card.
        
        Returns:
            CustomerCard: The newly created customer card instance.
        """
        return self.repo.create(data)

    def update(self, card_number: str, data: CustomerCardUpdate) -> CustomerCard:
        """
        Update an existing customer card identified by card number with new data.
        
        Parameters:
            card_number (str): The unique identifier of the customer card to update.
            data (CustomerCardUpdate): The updated information for the customer card.
        
        Returns:
            CustomerCard: The updated customer card object.
        """
        return self.repo.update(card_number, data)

    def delete(self, card_number: str) -> None:
        """
        Delete a customer card identified by its card number.
        """
        self.repo.delete(card_number)
