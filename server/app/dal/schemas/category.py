from pydantic import BaseModel


class Category(BaseModel):
    category_number: int
    category_name: str
