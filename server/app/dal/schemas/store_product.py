from typing import Optional

from pydantic import BaseModel, Field


class BaseStoreProduct(BaseModel):
    UPC_prom: Optional[str] = Field(
        min_length=12, max_length=12, examples=["7-12345-00001-9"]
    )
    id_product: int = Field(examples=[1])
    selling_price: float = Field(ge=0, examples=[10.00, 10.01, 10.02])
    products_number: int = Field(ge=0, examples=[1, 2, 3])
    promotional_product: bool = Field(examples=[True, False])


class StoreProduct(BaseStoreProduct):
    UPC: str = Field(min_length=12, max_length=12, examples=["036000291452"])


class CreateStoreProduct(StoreProduct):
    pass


class UpdateStoreProduct(BaseStoreProduct):
    pass


class CreatePromotionalProduct(BaseModel):
    promotional_UPC: str = Field(
        min_length=12, max_length=12, examples=["036000291453"]
    )
    units_to_convert: int = Field(ge=1, examples=[5, 10, 15])
