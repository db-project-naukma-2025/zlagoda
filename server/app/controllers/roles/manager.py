from ...controllers.permissions import BasicPermission
from ...dal.schemas import Category, CustomerCard, Employee, Product, StoreProduct
from ._base import UserRoleController


class UserManagerPermissionController(UserRoleController):
    def get_role_name(self) -> str:
        return "Manager"

    def get_permissions(self) -> list[tuple[type, BasicPermission]]:
        return [
            (Employee, BasicPermission.VIEW),
            (Employee, BasicPermission.CREATE),
            (Employee, BasicPermission.UPDATE),
            (Employee, BasicPermission.DELETE),
            (Category, BasicPermission.VIEW),
            (Category, BasicPermission.CREATE),
            (Category, BasicPermission.UPDATE),
            (Category, BasicPermission.DELETE),
            (Product, BasicPermission.VIEW),
            (Product, BasicPermission.CREATE),
            (Product, BasicPermission.UPDATE),
            (Product, BasicPermission.DELETE),
            (StoreProduct, BasicPermission.VIEW),
            (StoreProduct, BasicPermission.CREATE),
            (StoreProduct, BasicPermission.UPDATE),
            (StoreProduct, BasicPermission.DELETE),
            (CustomerCard, BasicPermission.VIEW),
            (CustomerCard, BasicPermission.CREATE),
            (CustomerCard, BasicPermission.UPDATE),
            (CustomerCard, BasicPermission.DELETE),
        ]
