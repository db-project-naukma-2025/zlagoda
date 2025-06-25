from ...controllers.permissions import BasicPermission
from ...dal.schemas import (
    Category,
    CustomerCard,
    Employee,
    Product,
    RelationalCheck,
    StoreProduct,
)
from ._base import UserRoleController
from .manager import PDF_PERMISSION

VIEW_SELF_PERMISSION = "view_self"


class UserCashierPermissionController(UserRoleController):
    def get_role_name(self) -> str:
        return "Cashier"

    def get_permissions(self) -> list[tuple[type, BasicPermission | str]]:
        return [
            (Category, BasicPermission.VIEW),
            (CustomerCard, BasicPermission.VIEW),
            (CustomerCard, BasicPermission.UPDATE),
            (StoreProduct, BasicPermission.VIEW),
            (Product, BasicPermission.VIEW),
            (RelationalCheck, BasicPermission.VIEW),
            (RelationalCheck, BasicPermission.CREATE),
            (Employee, VIEW_SELF_PERMISSION),
            (RelationalCheck, PDF_PERMISSION),
        ]
