from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query, Security
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..controllers.category import (
    CategoryModificationController,
    CategoryQueryController,
)
from ..dal.schemas.auth import User
from ..dal.schemas.category import Category
from ..ioc_container import category_modification_controller, category_query_controller
from .auth import BasicPermission, require_permission, require_user

router = APIRouter(
    prefix="/categories", tags=["categories"], dependencies=[Depends(require_user)]
)


class PaginatedCategories(BaseModel):
    data: list[Category]
    total: int
    page: int
    page_size: int
    total_pages: int


class CreateCategoryRequest(BaseModel):
    category_name: str


class UpdateCategoryRequest(BaseModel):
    category_name: str


class BulkDeleteCategoryRequest(BaseModel):
    category_numbers: list[int]


class CategoryRevenueReport(BaseModel):
    category_number: int
    category_name: str
    total_amount: int
    total_revenue: float


class CategoryWithAllProductsSold(BaseModel):
    category_number: int
    category_name: str


@cbv(router)
class CategoryViewSet:
    category_query_controller: CategoryQueryController = Depends(
        category_query_controller
    )
    category_modification_controller: CategoryModificationController = Depends(
        category_modification_controller
    )

    @router.get("/", response_model=PaginatedCategories, operation_id="getCategories")
    async def get_categories(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(
            10, ge=1, le=1000, description="Maximum number of records to return"
        ),
        search: str = Query(None, description="Search categories by name"),
        sort_by: Literal["category_number", "category_name"] = Query(
            "category_number", description="Field to sort by"
        ),
        sort_order: Literal["asc", "desc"] = Query("asc", description="Sort order"),
        _: User = Security(require_permission((Category, BasicPermission.VIEW))),
    ):
        categories, total = self.category_query_controller.get_all(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total_pages = (total + limit - 1) // limit

        return PaginatedCategories(
            data=categories,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            total_pages=total_pages,
        )

    @router.get(
        "/{category_number}", response_model=Category, operation_id="getCategory"
    )
    async def get_category(
        self,
        category_number: int,
        _: User = Security(require_permission((Category, BasicPermission.VIEW))),
    ):
        return self.category_query_controller.get_category(category_number)

    @router.post("/", response_model=Category, operation_id="createCategory")
    async def create_category(
        self,
        request: CreateCategoryRequest,
        _: User = Security(require_permission((Category, BasicPermission.CREATE))),
    ):
        return self.category_modification_controller.create(request.category_name)

    @router.put(
        "/{category_number}", response_model=Category, operation_id="updateCategory"
    )
    async def update_category(
        self,
        category_number: int,
        request: UpdateCategoryRequest,
        _: User = Security(require_permission((Category, BasicPermission.UPDATE))),
    ):
        return self.category_modification_controller.update(
            category_number, request.category_name
        )

    @router.delete("/{category_number}", operation_id="deleteCategory")
    async def delete_category(
        self,
        category_number: int,
        _: User = Security(require_permission((Category, BasicPermission.DELETE))),
    ):
        return self.category_modification_controller.delete(category_number)

    @router.post("/bulk-delete", operation_id="bulkDeleteCategories")
    async def bulk_delete_categories(
        self,
        request: BulkDeleteCategoryRequest,
        _: User = Security(require_permission((Category, BasicPermission.DELETE))),
    ):
        return self.category_modification_controller.delete_multiple(
            request.category_numbers
        )

    @router.get(
        "/reports/revenue",
        response_model=list[CategoryRevenueReport],
        operation_id="getCategoryRevenueReport",
    )
    async def get_category_revenue_report(
        self,
        date_from: date = Query(
            None, description="Start date for revenue report (YYYY-MM-DD format)"
        ),
        date_to: date = Query(
            None, description="End date for revenue report (YYYY-MM-DD format)"
        ),
        _: User = Security(require_permission((Category, BasicPermission.VIEW))),
    ):
        report_data = self.category_query_controller.get_category_revenue_report(
            date_from, date_to
        )
        return [CategoryRevenueReport(**item) for item in report_data]

    @router.get(
        "/reports/all-products-sold",
        response_model=list[CategoryWithAllProductsSold],
        operation_id="getCategoriesWithAllProductsSold",
    )
    async def get_categories_with_all_products_sold(
        self,
        _: User = Security(require_permission((Category, BasicPermission.VIEW))),
    ):
        report_data = (
            self.category_query_controller.get_categories_with_all_products_sold()
        )
        return [CategoryWithAllProductsSold(**item) for item in report_data]
