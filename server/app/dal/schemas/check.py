from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from .sale import CreateSale, Sale


class BaseCheck(BaseModel):
    check_number: str = Field(min_length=10, max_length=10, examples=["1010101010"])
    id_employee: str = Field(min_length=10, max_length=10, examples=["0000000001"])
    card_number: Optional[str] = Field(
        None, min_length=1, max_length=13, examples=["1234567890123"]
    )
    print_date: datetime = Field(examples=["2025-01-15T12:30:00"])

    @field_validator("print_date")
    @classmethod
    def validate_date_not_future(cls, v: datetime) -> datetime:
        if v > datetime.now():
            raise ValueError("Check date cannot be in the future")
        return v


class RelationalCheck(BaseCheck):
    sum_total: float = Field(ge=0, examples=[150.99])
    vat: float = Field(ge=0, examples=[25.165])


class CreateCheck(BaseCheck):
    sales: list[CreateSale]


class Check(RelationalCheck):
    sales: list[Sale]
