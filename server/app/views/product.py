from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..dal.repositories.product import ProductRepository
from ..dal.schemas.auth import User
from ..dal.schemas.product import CreateProduct, Product, UpdateProduct
from ..db.connection.exceptions import IntegrityError
from ..ioc_container import product_repository
from .auth import BasicPermission, require_permission, require_user

router = APIRouter(
    prefix="/products",
    tags=["products"],
    dependencies=[Depends(require_user)],
)


class PaginatedProducts(BaseModel):
    data: list[Product]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteRequest(BaseModel):
    product_ids: list[int]


@cbv(router)
class ProductViewSet:
    @router.get("/", response_model=PaginatedProducts, operation_id="getProducts")
    async def get_products(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(
            10, ge=1, le=1000, description="Maximum number of records to return"
        ),
        search: str = Query(None, description="Search products by name"),
        sort_by: Literal["id_product", "product_name", "category_number"] = Query(
            "id_product", description="Field to sort by"
        ),
        sort_order: Literal["asc", "desc"] = Query("asc", description="Sort order"),
        category_number: Optional[int] = Query(None, description="Filter by category"),
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.VIEW))),
    ):
        products = repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            category_number=category_number,
        )
        total = repo.get_total_count(search=search, category_number=category_number)
        total_pages = (total + limit - 1) // limit

        return PaginatedProducts(
            data=products,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            total_pages=total_pages,
        )

    @router.get("/{id_product}", response_model=Product, operation_id="getProduct")
    async def get_product(
        self,
        id_product: int,
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.VIEW))),
    ):
        return repo.get_by_id(id_product)

    @router.post("/", response_model=Product, operation_id="createProduct")
    async def create_product(
        self,
        request: CreateProduct,
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.CREATE))),
    ):
        return repo.create(request)

    @router.put("/{id_product}", response_model=Product, operation_id="updateProduct")
    async def update_product(
        self,
        id_product: int,
        request: UpdateProduct,
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.UPDATE))),
    ):
        return repo.update(id_product, request)

    @router.delete("/{id_product}", operation_id="deleteProduct")
    async def delete_product(
        self,
        id_product: int,
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.DELETE))),
    ):
        try:
            return repo.delete(id_product)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete product because it is associated with store products",
            ) from e

    @router.post("/bulk-delete", operation_id="bulkDeleteProducts")
    async def bulk_delete_products(
        self,
        request: BulkDeleteRequest,
        repo: ProductRepository = Depends(product_repository),
        _: User = Security(require_permission((Product, BasicPermission.DELETE))),
    ):
        try:
            return repo.delete_multiple(request.product_ids)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete product because it is associated with store products",
            ) from e
