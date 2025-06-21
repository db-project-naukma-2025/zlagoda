from datetime import date
from typing import Literal, Optional, Self

from pydantic import BaseModel, Field, field_validator, model_validator


class BaseEmployee(BaseModel):
    empl_surname: str = Field(max_length=50)
    empl_name: str = Field(max_length=50)
    empl_patronymic: Optional[str] = Field(max_length=50)
    empl_role: Literal["cashier", "manager"] = Field(max_length=10)
    salary: float = Field(ge=0)
    date_of_birth: date = Field(examples=["2005-05-15"])
    date_of_start: date = Field(examples=["2025-06-15"])
    phone_number: str = Field(min_length=13, max_length=13, examples=["+3804567890123"])
    city: str = Field(max_length=50)
    street: str = Field(max_length=50)
    zip_code: str = Field(min_length=5, max_length=9, examples=["123456789"])

    @model_validator(mode="after")
    def validate_age_at_start(self) -> Self:
        min_birth_date = self.date_of_start.replace(year=self.date_of_start.year - 18)
        if self.date_of_birth > min_birth_date:
            raise ValueError(
                f"Employee must be at least 18 years old at the date of start ({self.date_of_start})"
            )
        return self

    @field_validator("phone_number")
    @classmethod
    def phone_max_13(cls, phone: str) -> str:
        if phone[0] != "+":
            raise ValueError("Phone number must start with a '+'")
        if not all(c.isdigit() or c == "+" for c in phone):
            raise ValueError("Phone number must contain only digits and '+'")
        return phone


class Employee(BaseEmployee):
    id_employee: str = Field(min_length=10, max_length=10, examples=["0000000001"])


class CreateEmployee(Employee):
    pass


class UpdateEmployee(BaseEmployee):
    pass


class EmployeeWorkStatistics(BaseModel):
    total_checks: int = Field(description="Total number of checks created")
    total_sales_amount: float = Field(description="Total amount of all sales")
    total_items_sold: int = Field(description="Total number of items sold")
    average_check_amount: float = Field(description="Average amount per check")
    customers_served: int = Field(description="Number of unique customers served")
    days_worked: int = Field(description="Number of days with at least one check")
    most_recent_check_date: Optional[date] = Field(
        description="Date of most recent check"
    )
    most_sold_product_name: Optional[str] = Field(
        description="Name of most frequently sold product"
    )
    most_sold_product_quantity: int = Field(description="Quantity of most sold product")


class EmployeeSelfInfo(BaseModel):
    """Comprehensive employee information including personal details and work statistics"""

    employee: Employee
    statistics: EmployeeWorkStatistics
    work_experience_days: int = Field(description="Total days since start date")
    age: int = Field(description="Current age in years")
