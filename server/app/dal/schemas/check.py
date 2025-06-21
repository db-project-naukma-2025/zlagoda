from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from .sale import CreateSale, Sale


class BaseCheck(BaseModel):
    check_number: str = Field(min_length=10, max_length=10, examples=["1010101010"])
    card_number: Optional[str] = Field(
        min_length=1, max_length=13, examples=["1234567890123"]
    )
    print_date: datetime = Field(examples=["2025-01-15T12:30:00Z"])

    @field_validator("print_date")
    @classmethod
    def validate_date_not_future(cls, v: datetime) -> datetime:
        if v.tzinfo is not None:
            now = datetime.now(timezone.utc)
        else:
            now = datetime.now()

        if v > now:
            raise ValueError("Check date cannot be in the future")
        return v

    model_config = {
        "json_encoders": {
            datetime: lambda v: v.isoformat() + "Z"
            if v.tzinfo is None
            else v.isoformat()
        }
    }


class RelationalCheck(BaseCheck):
    id_employee: str = Field(min_length=10, max_length=10, examples=["0000000001"])
    sum_total: float = Field(ge=0, examples=[150.99])
    vat: float = Field(ge=0, examples=[25.165])


class CreateCheck(BaseCheck):
    sales: list[CreateSale]


class Check(RelationalCheck):
    sales: list[Sale]
