from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi_utils.cbv import cbv
from pydantic import BaseModel

from ..dal.repositories.store_product import StoreProductRepository
from ..dal.schemas.store_product import (
    CreatePromotionalProduct,
    CreateStoreProduct,
    StoreProduct,
    UpdateStoreProduct,
)
from ..db.connection import transaction
from ..ioc_container import store_product_repository
from .auth import require_user

router = APIRouter(
    prefix="/store-products",
    tags=["store-products"],
    dependencies=[Depends(require_user)],
)


class PaginatedStoreProducts(BaseModel):
    data: list[StoreProduct]
    total: int
    page: int
    page_size: int
    total_pages: int


class BulkDeleteRequest(BaseModel):
    upcs: list[str]


@cbv(router)
class StoreProductViewSet:
    @router.get(
        "/", response_model=PaginatedStoreProducts, operation_id="getStoreProducts"
    )
    async def get_store_products(
        self,
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(
            10, ge=1, le=1000, description="Maximum number of records to return"
        ),
        search: str = Query(
            None, description="Search store products by UPC, product name, or category"
        ),
        sort_by: Literal[
            "UPC", "selling_price", "products_number", "promotional_product", "UPC_prom"
        ] = Query("UPC", description="Field to sort by"),
        sort_order: Literal["asc", "desc"] = Query("asc", description="Sort order"),
        promotional_only: Optional[bool] = Query(
            None, description="Filter by promotional products"
        ),
        id_product: Optional[int] = Query(None, description="Filter by product ID"),
        repo: StoreProductRepository = Depends(store_product_repository),
    ):
        store_products = repo.get_all(
            skip=skip,
            limit=limit,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order,
            promotional_only=promotional_only,
            id_product=id_product,
        )
        total = repo.get_total_count(
            search=search, promotional_only=promotional_only, id_product=id_product
        )
        total_pages = (total + limit - 1) // limit

        return PaginatedStoreProducts(
            data=store_products,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit,
            total_pages=total_pages,
        )

    @router.get("/{upc}", response_model=StoreProduct, operation_id="getStoreProduct")
    async def get_store_product(
        self, upc: str, repo: StoreProductRepository = Depends(store_product_repository)
    ):
        return repo.get_by_upc(upc)

    @router.post("/", response_model=StoreProduct, operation_id="createStoreProduct")
    async def create_store_product(
        self,
        request: CreateStoreProduct,
        repo: StoreProductRepository = Depends(store_product_repository),
    ):
        await self._validate_product_upc_uniqueness(request.UPC, repo)
        await self._validate_promotional_product_uniqueness(
            request.id_product, request.promotional_product, repo
        )
        await self._validate_upc_prom_not_self_reference(request.UPC_prom, request.UPC)

        # If this is a promotional product, automatically set price to 0.8 of the regular product
        if request.promotional_product:
            regular_product = repo.get_regular_product_for_product_id(
                request.id_product
            )
            if regular_product:
                request.selling_price = regular_product.selling_price * 0.8
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot create promotional product without a regular product for the same product ID",
                )

        return repo.create(request)

    @router.post(
        "/{source_upc}/create-promotional",
        response_model=StoreProduct,
        operation_id="createPromotionalProduct",
    )
    async def create_promotional_product(
        self,
        source_upc: str,
        request: CreatePromotionalProduct,
        repo: StoreProductRepository = Depends(store_product_repository),
    ):
        # Get the source store product
        source_product = repo.get_by_upc(source_upc)
        if not source_product:
            raise HTTPException(
                status_code=404, detail="Source store product not found"
            )

        # Validate source product is not promotional
        if source_product.promotional_product:
            raise HTTPException(
                status_code=400,
                detail="Cannot create promotional product from another promotional product",
            )

        # Validate units to convert
        if request.units_to_convert > source_product.products_number:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot convert {request.units_to_convert} units. Only {source_product.products_number} units available.",
            )

        # Check if promotional product already exists for this product
        existing_promotional = repo.get_promotional_product_for_product_id(
            source_product.id_product
        )
        if existing_promotional:
            raise HTTPException(
                status_code=400,
                detail="A promotional product already exists for this product",
            )

        # Validate promotional UPC uniqueness
        await self._validate_product_upc_uniqueness(request.promotional_UPC, repo)

        # Validate promotional UPC is different from source UPC
        if request.promotional_UPC == source_upc:
            raise HTTPException(
                status_code=400,
                detail="Promotional UPC must be different from source UPC",
            )

        # Create the promotional product
        promotional_product_data = CreateStoreProduct(
            UPC=request.promotional_UPC,
            UPC_prom=None,
            id_product=source_product.id_product,
            selling_price=source_product.selling_price * 0.8,  # 20% discount
            products_number=request.units_to_convert,
            promotional_product=True,
        )
        updated_source_data = UpdateStoreProduct(
            UPC_prom=request.promotional_UPC,
            id_product=source_product.id_product,
            selling_price=source_product.selling_price,
            products_number=source_product.products_number - request.units_to_convert,
            promotional_product=False,
        )

        with transaction(repo._db):
            promotional_product = repo.create(promotional_product_data)
            repo.update(source_upc, updated_source_data)

        return promotional_product

    @router.put(
        "/{upc}", response_model=StoreProduct, operation_id="updateStoreProduct"
    )
    async def update_store_product(
        self,
        upc: str,
        request: UpdateStoreProduct,
        repo: StoreProductRepository = Depends(store_product_repository),
    ):
        # Get the current store product
        current_product = repo.get_by_upc(upc)
        if not current_product:
            raise HTTPException(status_code=404, detail="Store product not found")

        # Prevent price changes on promotional products
        if (
            current_product.promotional_product
            and request.selling_price != current_product.selling_price
        ):
            raise HTTPException(
                status_code=400,
                detail="Cannot change price on promotional products. Please change the price on the regular product instead.",
            )

        await self._validate_promotional_product_uniqueness(
            request.id_product, request.promotional_product, repo, exclude_upc=upc
        )
        await self._validate_upc_prom_not_self_reference(request.UPC_prom, upc)

        # Update the product
        updated_product = repo.update(upc, request)

        # If this is a regular product and price changed, update promotional product price if it exists
        if (
            not current_product.promotional_product
            and request.selling_price != current_product.selling_price
        ):
            promotional_product = repo.get_promotional_product_for_product_id(
                request.id_product
            )
            if promotional_product:
                promotional_update = UpdateStoreProduct(
                    UPC_prom=promotional_product.UPC_prom,
                    id_product=promotional_product.id_product,
                    selling_price=request.selling_price * 0.8,
                    products_number=promotional_product.products_number,
                    promotional_product=promotional_product.promotional_product,
                )
                repo.update(promotional_product.UPC, promotional_update)

        return updated_product

    @router.delete("/{upc}", operation_id="deleteStoreProduct")
    async def delete_store_product(
        self, upc: str, repo: StoreProductRepository = Depends(store_product_repository)
    ):
        # Get the current store product
        current_product = repo.get_by_upc(upc)
        if not current_product:
            raise HTTPException(status_code=404, detail="Store product not found")

        # Prevent deletion of regular products that have promotional versions
        if not current_product.promotional_product:
            promotional_product = repo.get_promotional_product_for_product_id(
                current_product.id_product
            )
            if promotional_product:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete regular product that has a promotional version. Please delete the promotional product first.",
                )

        return repo.delete(upc)

    @router.post("/bulk-delete", operation_id="bulkDeleteStoreProducts")
    async def bulk_delete_store_products(
        self,
        request: BulkDeleteRequest,
        repo: StoreProductRepository = Depends(store_product_repository),
    ):
        # Check each UPC for promotional dependencies
        for upc in request.upcs:
            current_product = repo.get_by_upc(upc)
            if current_product and not current_product.promotional_product:
                promotional_product = repo.get_promotional_product_for_product_id(
                    current_product.id_product
                )
                if promotional_product:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Cannot delete regular product {upc} that has a promotional version. Please delete the promotional product first.",
                    )

        return repo.delete_multiple(request.upcs)

    async def _validate_product_upc_uniqueness(
        self,
        upc: str,
        store_product_repo: StoreProductRepository,
    ):
        if store_product_repo.get_by_upc(upc):
            raise HTTPException(status_code=400, detail="UPC already exists")

    async def _validate_promotional_product_uniqueness(
        self,
        id_product: int,
        promotional_product: bool,
        store_product_repo: StoreProductRepository,
        exclude_upc: Optional[str] = None,
    ):
        product_type = "promotional" if promotional_product else "non-promotional"

        if store_product_repo.exists_for_product_and_promo_type(
            id_product, promotional_product, exclude_upc
        ):
            raise HTTPException(
                status_code=400,
                detail=f"A {product_type} store product already exists for product ID {id_product}",
            )

    async def _validate_upc_prom_not_self_reference(
        self, upc_prom: Optional[str], current_upc: str
    ):
        if upc_prom and upc_prom == current_upc:
            raise HTTPException(
                status_code=400,
                detail="UPC_prom cannot be the same as UPC - a product cannot refer to itself",
            )
