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
from .auth import require_user

router = APIRouter(
    prefix="/customer-cards",
    tags=["customer-cards"],
    dependencies=[Depends(require_user)],
)


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
        return self.query_controller.get_customer_card(card_number)

    @router.post("/", response_model=CustomerCard, operation_id="createCustomerCard")
    async def create_customer_card(self, request: CustomerCardCreate):
        return self.modification_controller.create(request)

    @router.put(
        "/{card_number}", response_model=CustomerCard, operation_id="updateCustomerCard"
    )
    async def update_customer_card(self, card_number: str, request: CustomerCardUpdate):
        return self.modification_controller.update(card_number, request)

    @router.delete("/{card_number}", operation_id="deleteCustomerCard")
    async def delete_customer_card(self, card_number: str):
        return self.modification_controller.delete(card_number)

    @router.post("/bulk-delete", operation_id="bulkDeleteCustomerCards")
    async def bulk_delete_customer_cards(self, request: BulkDeleteCustomerCardRequest):
        for card_number in request.card_numbers:
            self.modification_controller.delete(card_number)
