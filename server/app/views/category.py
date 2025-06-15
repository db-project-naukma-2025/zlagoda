from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from ..dal.repositories.category import CategoryRepository
from ..dal.schemas.category import Category
from ..db import get_db
from ..db.connection._base import IDatabase

router = APIRouter(prefix="/categories", tags=["categories"])


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


class BulkDeleteRequest(BaseModel):
    category_numbers: list[int]


def get_category_repository(db: IDatabase = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(db)


@router.get("/", response_model=PaginatedCategories, operation_id="getCategories")
async def get_categories(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        10, ge=1, le=1000, description="Maximum number of records to return"
    ),
    search: str = Query(None, description="Search categories by name"),
    sort_by: Literal["category_number", "category_name"] = Query(
        "category_number", description="Field to sort by"
    ),
    sort_order: Literal["asc", "desc"] = Query("asc", description="Sort order"),
    repo: CategoryRepository = Depends(get_category_repository),
):
    categories = repo.get_all(
        skip=skip, limit=limit, search=search, sort_by=sort_by, sort_order=sort_order
    )
    total = repo.get_total_count(search=search)
    total_pages = (total + limit - 1) // limit

    return PaginatedCategories(
        data=categories,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages,
    )


@router.get("/{category_number}", response_model=Category, operation_id="getCategory")
async def get_category(
    category_number: int, repo: CategoryRepository = Depends(get_category_repository)
):
    return repo.get_by_number(category_number)


@router.post("/", response_model=Category, operation_id="createCategory")
async def create_category(
    request: CreateCategoryRequest,
    repo: CategoryRepository = Depends(get_category_repository),
):
    return repo.create(request.category_name)


@router.put(
    "/{category_number}", response_model=Category, operation_id="updateCategory"
)
async def update_category(
    category_number: int,
    request: UpdateCategoryRequest,
    repo: CategoryRepository = Depends(get_category_repository),
):
    return repo.update(category_number, request.category_name)


@router.delete("/{category_number}", operation_id="deleteCategory")
async def delete_category(
    category_number: int, repo: CategoryRepository = Depends(get_category_repository)
):
    return repo.delete(category_number)


@router.post("/bulk-delete", operation_id="bulkDeleteCategories")
async def bulk_delete_categories(
    request: BulkDeleteRequest,
    repo: CategoryRepository = Depends(get_category_repository),
):
    return repo.delete_multiple(request.category_numbers)
