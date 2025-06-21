from abc import ABC
from datetime import date
from typing import Literal, Optional

from ..dal.repositories.category import CategoryRepository
from ..dal.schemas.category import Category


class BaseCategoryController(ABC):
    def __init__(self, repo: CategoryRepository):
        self.repo = repo


class CategoryQueryController(BaseCategoryController):
    def get_category(self, category_number: int) -> Category | None:
        return self.repo.get_by_number(category_number)

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        sort_by: Literal["category_number", "category_name"] = "category_number",
        sort_order: Literal["asc", "desc"] = "asc",
    ) -> tuple[list[Category], int]:
        categories = self.repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        total = self.repo.get_total_count(search=search)
        return categories, total

    def get_category_revenue_report(
        self, date_from: Optional[date] = None, date_to: Optional[date] = None
    ) -> list[dict]:
        """Get revenue report for categories within a date range. If no dates provided, shows all time."""
        return self.repo.get_category_revenue_report(date_from, date_to)

    def get_categories_with_all_products_sold(self) -> list[dict]:
        """Get categories where all products have been sold at least once."""
        return self.repo.get_categories_with_all_products_sold()


class CategoryModificationController(BaseCategoryController):
    def create(self, category_name: str) -> Category:
        return self.repo.create(category_name)

    def update(self, category_number: int, category_name: str) -> Category:
        return self.repo.update(category_number, category_name)

    def delete(self, category_number: int) -> None:
        self.repo.delete(category_number)

    def delete_multiple(self, category_numbers: list[int]) -> None:
        self.repo.delete_multiple(category_numbers)
