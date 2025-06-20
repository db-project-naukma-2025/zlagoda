from pydantic import BaseModel, Field, field_validator


class BaseSale(BaseModel):
    UPC: str = Field(min_length=12, max_length=12, examples=["036000291452"])
    product_number: int = Field(gt=0, examples=[2])


class SaleWithPrice(BaseSale):
    selling_price: float = Field(gt=0, examples=[49.99])


class Sale(SaleWithPrice):
    check_number: str = Field(min_length=10, max_length=10, examples=["1010101010"])
    selling_price: float = Field(gt=0, examples=[49.99])

    @field_validator("selling_price")
    @classmethod
    def round_price(cls, v: float) -> float:
        return round(v, 4)


class CreateSale(BaseSale):
    pass
