from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.customer_card import (
    CustomerCardModificationController,
    CustomerCardQueryController,
)
from ..dal.repositories.customer_card import CustomerCardRepository
from ..dal.schemas.auth import User
from ..dal.schemas.customer_card import (
    CustomerCard,
    CustomerCardCreate,
    CustomerCardUpdate,
)
from ..db.connection.exceptions import IntegrityError
from ..ioc_container import (
    customer_card_modification_controller,
    customer_card_query_controller,
    customer_card_repository,
)
from ._base import BulkDelete, PaginatedResponse, PaginationHelper
from .auth import BasicPermission, require_permission, require_user

router = APIRouter(
    prefix="/customer-cards",
    tags=["customer-cards"],
    dependencies=[Depends(require_user)],
)


class CardSoldCategoriesReport(BaseModel):
    card_number: str
    customer_name: str
    category_name: str
    total_products: int
    total_revenue: float


class BulkDeleteCustomerCard(BulkDelete[str]):
    pass


@cbv(router)
class CustomerCardViewSet:
    query_controller: CustomerCardQueryController = Depends(
        customer_card_query_controller
    )
    modification_controller: CustomerCardModificationController = Depends(
        customer_card_modification_controller
    )
    customer_card_repository: CustomerCardRepository = Depends(customer_card_repository)

    @router.get(
        "/",
        response_model=PaginatedResponse[CustomerCard],
        operation_id="getCustomerCards",
    )
    async def get_customer_cards(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: Optional[int] = Query(
            10, ge=1, le=1000, description="Maximum number of records to return"
        ),
        _: User = Security(require_permission((CustomerCard, BasicPermission.VIEW))),
    ):
        customer_cards, total = self.query_controller.get_all(
            limit=limit,
            offset=skip,
        )

        return PaginationHelper.create_paginated_response(
            data=customer_cards, total=total, skip=skip, limit=limit
        )

    @router.get(
        "/reports/card-sold-categories",
        response_model=list[CardSoldCategoriesReport],
        operation_id="getCardSoldCategoriesReport",
    )
    async def get_card_sold_categories_report(
        self,
        card_number: str = Query(default=None, description="Card number"),
        category_name: str = Query(default=None, description="Category name"),
        start_date: date = Query(
            default=None, description="Start date", pattern=r"^\d{4}-\d{2}-\d{2}$"
        ),
        end_date: date = Query(
            default=None, description="End date", pattern=r"^\d{4}-\d{2}-\d{2}$"
        ),
        _: User = Security(require_permission((CustomerCard, BasicPermission.VIEW))),
    ):
        rows = self.query_controller.get_card_sold_categories(
            card_number=card_number,
            category_name=category_name,
            start_date=start_date,
            end_date=end_date,
        )
        return [CardSoldCategoriesReport(**row) for row in rows]

    @router.get(
        "/{card_number}", response_model=CustomerCard, operation_id="getCustomerCard"
    )
    async def get_customer_card(
        self,
        card_number: str,
        _: User = Security(require_permission((CustomerCard, BasicPermission.VIEW))),
    ):
        return self.query_controller.get_customer_card(card_number)

    @router.post("/", response_model=CustomerCard, operation_id="createCustomerCard")
    async def create_customer_card(
        self,
        request: CustomerCardCreate,
        _: User = Security(require_permission((CustomerCard, BasicPermission.CREATE))),
    ):
        return self.modification_controller.create(request)

    @router.put(
        "/{card_number}", response_model=CustomerCard, operation_id="updateCustomerCard"
    )
    async def update_customer_card(
        self,
        card_number: str,
        request: CustomerCardUpdate,
        _: User = Security(require_permission((CustomerCard, BasicPermission.UPDATE))),
    ):
        return self.modification_controller.update(card_number, request)

    @router.delete("/{card_number}", operation_id="deleteCustomerCard")
    async def delete_customer_card(
        self,
        card_number: str,
        _: User = Security(require_permission((CustomerCard, BasicPermission.DELETE))),
    ):
        try:
            return self.modification_controller.delete(card_number)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete customer card because it is associated with checks",
            ) from e

    @router.post("/bulk-delete", operation_id="bulkDeleteCustomerCards")
    async def bulk_delete_customer_cards(
        self,
        request: BulkDeleteCustomerCard,
        _: User = Security(require_permission((CustomerCard, BasicPermission.DELETE))),
    ):
        try:
            return self.modification_controller.delete_multiple(request.ids)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete customer card because it is associated with checks",
            ) from e
