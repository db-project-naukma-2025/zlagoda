from fastapi import APIRouter, Depends, Query
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.customer_card import (
    CustomerCardModificationController,
    CustomerCardQueryController,
)
from ..dal.schemas.customer_card import (
    CustomerCard,
    CustomerCardCreate,
    CustomerCardUpdate,
)
from ..ioc_container import (
    customer_card_modification_controller,
    customer_card_query_controller,
)

router = APIRouter(prefix="/customer-cards", tags=["customer-cards"])


class PaginatedCustomerCards(BaseModel):
    data: list[CustomerCard]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteCustomerCardRequest(BaseModel):
    card_numbers: list[str]


@cbv(router)
class CustomerCardViewSet:
    query_controller: CustomerCardQueryController = Depends(
        customer_card_query_controller
    )
    modification_controller: CustomerCardModificationController = Depends(
        customer_card_modification_controller
    )

    @router.get(
        "/", response_model=PaginatedCustomerCards, operation_id="getCustomerCards"
    )
    async def get_customer_cards(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(
            10, ge=1, le=1000, description="Maximum number of records to return"
        ),
    ):
        """
        Retrieve a paginated list of customer cards.
        
        Parameters:
            skip (int): The number of records to skip before starting to collect the result set.
            limit (int): The maximum number of records to return.
        
        Returns:
            PaginatedCustomerCards: An object containing the list of customer cards and pagination metadata.
        """
        customer_cards, total = self.query_controller.get_all(
            limit=limit,
            offset=skip,
        )
        total_pages = (total + limit - 1) // limit

        return PaginatedCustomerCards(
            data=customer_cards,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            total_pages=total_pages,
        )

    @router.get(
        "/{card_number}", response_model=CustomerCard, operation_id="getCustomerCard"
    )
    async def get_customer_card(self, card_number: str):
        """
        Retrieve a customer card by its card number.
        
        Parameters:
            card_number (str): The unique identifier of the customer card to retrieve.
        
        Returns:
            CustomerCard: The customer card associated with the given card number.
        """
        return self.query_controller.get_customer_card(card_number)

    @router.post("/", response_model=CustomerCard, operation_id="createCustomerCard")
    async def create_customer_card(self, request: CustomerCardCreate):
        """
        Create a new customer card using the provided data.
        
        Parameters:
            request (CustomerCardCreate): The data required to create a new customer card.
        
        Returns:
            CustomerCard: The newly created customer card.
        """
        return self.modification_controller.create(request)

    @router.put(
        "/{card_number}", response_model=CustomerCard, operation_id="updateCustomerCard"
    )
    async def update_customer_card(self, card_number: str, request: CustomerCardUpdate):
        """
        Update an existing customer card identified by its card number with new data.
        
        Parameters:
            card_number (str): The unique identifier of the customer card to update.
            request (CustomerCardUpdate): The updated data for the customer card.
        
        Returns:
            CustomerCard: The updated customer card object.
        """
        return self.modification_controller.update(card_number, request)

    @router.delete("/{card_number}", operation_id="deleteCustomerCard")
    async def delete_customer_card(self, card_number: str):
        """
        Delete a customer card identified by its card number.
        
        Parameters:
            card_number (str): The unique card number of the customer card to delete.
        
        Returns:
            The result of the deletion operation as provided by the modification controller.
        """
        return self.modification_controller.delete(card_number)

    @router.post("/bulk-delete", operation_id="bulkDeleteCustomerCards")
    async def bulk_delete_customer_cards(self, request: BulkDeleteCustomerCardRequest):
        """
        Delete multiple customer cards specified by a list of card numbers.
        
        Parameters:
            request (BulkDeleteCustomerCardRequest): Contains the list of card numbers to delete.
        """
        for card_number in request.card_numbers:
            self.modification_controller.delete(card_number)
