from typing import Literal

from fastapi import APIRouter, Depends, Query
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..dal.repositories.category import CategoryRepository
from ..dal.schemas.category import Category
from ..ioc_container import category_repository
from .auth import BasicPermission, PermissionCheck, require_permission, require_user

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


@cbv(router)
class CategoryViewSet:
    repo: CategoryRepository = Depends(category_repository)

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
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.VIEW))

        categories = self.repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total = self.repo.get_total_count(search=search)
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
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.VIEW))

        return self.repo.get_by_number(category_number)

    @router.post("/", response_model=Category, operation_id="createCategory")
    async def create_category(
        self,
        request: CreateCategoryRequest,
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.CREATE))

        return self.repo.create(request.category_name)

    @router.put(
        "/{category_number}", response_model=Category, operation_id="updateCategory"
    )
    async def update_category(
        self,
        category_number: int,
        request: UpdateCategoryRequest,
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.UPDATE))

        return self.repo.update(category_number, request.category_name)

    @router.delete("/{category_number}", operation_id="deleteCategory")
    async def delete_category(
        self,
        category_number: int,
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.DELETE))

        return self.repo.delete(category_number)

    @router.post("/bulk-delete", operation_id="bulkDeleteCategories")
    async def bulk_delete_categories(
        self,
        request: BulkDeleteCategoryRequest,
        has_permission: PermissionCheck = Depends(require_permission),
    ):
        has_permission((Category, BasicPermission.DELETE))

        return self.repo.delete_multiple(request.category_numbers)
