from pydantic import BaseModel


class BaseProduct(BaseModel):
    category_number: int
    product_name: str
    characteristics: str


class Product(BaseProduct):
    id_product: int


class CreateProduct(BaseProduct):
    pass


class UpdateProduct(Product):
    pass
