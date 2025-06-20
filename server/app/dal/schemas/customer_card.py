from pydantic import BaseModel, Field

from ._base import UNSET, UnsetAnnotated

PHONE_NUMBER_REGEX = r"^\+\d{12}$"


class CustomerCardCreate(BaseModel):
    card_number: str = Field(min_length=1, max_length=13)
    cust_surname: str = Field(min_length=1, max_length=50)
    cust_name: str = Field(min_length=1, max_length=50)
    cust_patronymic: str | None = Field(min_length=1, max_length=50)
    phone_number: str = Field(min_length=1, max_length=13, pattern=PHONE_NUMBER_REGEX)
    city: str | None = Field(min_length=1, max_length=50)
    street: str | None = Field(min_length=1, max_length=50)
    zip_code: str | None = Field(min_length=1, max_length=9)
    percent: int = Field(ge=0, le=100)


class CustomerCard(CustomerCardCreate):
    pass


class CustomerCardUpdate(BaseModel):
    cust_surname: str | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=50
    )
    cust_name: str | UnsetAnnotated = Field(default=UNSET, min_length=1, max_length=50)
    cust_patronymic: str | None | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=50
    )
    phone_number: str | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=13, pattern=PHONE_NUMBER_REGEX
    )
    city: str | None | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=50
    )
    street: str | None | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=50
    )
    zip_code: str | None | UnsetAnnotated = Field(
        default=UNSET, min_length=1, max_length=9
    )
    percent: int | UnsetAnnotated = Field(default=UNSET, ge=0, le=100)
