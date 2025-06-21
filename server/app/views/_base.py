from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDelete(BaseModel, Generic[T]):
    ids: list[T]


class PaginationHelper:
    @staticmethod
    def calculate_pagination(total: int, skip: int, limit: Optional[int]):
        if limit is None:
            return {"total_pages": 1, "page": 1, "page_size": total}
        else:
            return {
                "total_pages": (total + limit - 1) // limit,
                "page": (skip // limit) + 1,
                "page_size": limit,
            }

    @staticmethod
    def create_paginated_response(
        data: list[T], total: int, skip: int, limit: Optional[int]
    ) -> PaginatedResponse[T]:
        pagination = PaginationHelper.calculate_pagination(total, skip, limit)

        return PaginatedResponse(
            data=data,
            total=total,
            page=pagination["page"],
            page_size=pagination["page_size"],
            total_pages=pagination["total_pages"],
        )
