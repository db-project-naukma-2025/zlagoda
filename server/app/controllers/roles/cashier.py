from ...controllers.permissions import (
    BasicPermission,
)
from ...dal.schemas import Category, CustomerCard, StoreProduct
from ._base import UserRoleController


class UserCashierPermissionController(UserRoleController):
    def get_role_name(self) -> str:
        return "Cashier"

    def get_permissions(self) -> list[tuple[type, BasicPermission]]:
        return [
            (Category, BasicPermission.VIEW),
            (CustomerCard, BasicPermission.VIEW),
            (CustomerCard, BasicPermission.UPDATE),
            (StoreProduct, BasicPermission.VIEW),
        ]
