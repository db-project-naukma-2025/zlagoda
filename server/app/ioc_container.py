from datetime import timedelta
from typing import Generator, Type

from fastapi import Depends
from pydantic import BaseModel

from . import settings
from .controllers.auth.hasher import IHasher, SHA256Hasher
from .controllers.auth.login import LoginController
from .controllers.auth.registration import RegistrationController
from .controllers.auth.token_generator import ITokenGenerator, JWTTokenGenerator
from .controllers.category import (
    CategoryModificationController,
    CategoryQueryController,
)
from .controllers.check import (
    CheckCleanupController,
    CheckModificationController,
    CheckQueryController,
)
from .controllers.customer_card import (
    CustomerCardModificationController,
    CustomerCardQueryController,
)
from .controllers.employee import (
    EmployeeModificationController,
    EmployeeQueryController,
)
from .controllers.permissions.group import UserGroupController
from .controllers.permissions.user import UserPermissionController
from .controllers.roles.cashier import UserCashierPermissionController
from .controllers.roles.employee import UserEmployeePermissionController
from .controllers.roles.manager import UserManagerPermissionController
from .dal.repositories.auth import (
    GroupPermissionRepository,
    GroupRepository,
    PermissionRepository,
    UserGroupRepository,
    UserRepository,
)
from .dal.repositories.category import CategoryRepository
from .dal.repositories.check import CheckRepository
from .dal.repositories.customer_card import CustomerCardRepository
from .dal.repositories.employee import EmployeeRepository
from .dal.repositories.product import ProductRepository
from .dal.repositories.sale import SaleRepository
from .dal.repositories.store_product import StoreProductRepository
from .dal.schemas import (
    Category,
    CustomerCard,
    Employee,
    Product,
    RelationalCheck,
    StoreProduct,
)
from .db.connection._base import IDatabase
from .db.migrations import DatabaseMigrationService

# Database setup


def create_db() -> IDatabase:
    config = settings.DATABASES["default"]
    connection_uri = f"{config['ENGINE']}://{config['USER']}:{config['PASSWORD']}@{config['HOST']}:{config['PORT']}/{config['NAME']}"
    match config["ENGINE"]:
        case "postgresql":
            from .db.connection.postgres import PostgresDatabase

            return PostgresDatabase(connection_uri)
        case _:
            raise RuntimeError(f"Unsupported database engine: {config['ENGINE']}")


def get_db() -> Generator[IDatabase, None, None]:
    with create_db() as db:
        yield db


def database_migration_service(
    db: IDatabase = Depends(get_db),
) -> DatabaseMigrationService:
    migrations_path = settings.BASE_PATH / "migrations"
    return DatabaseMigrationService(db, migrations_path)


# DAL setup


def model_registry() -> set[Type[BaseModel]]:
    return {Category, Product, StoreProduct, Employee, CustomerCard, RelationalCheck}


def category_repository(db: IDatabase = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(db)


def employee_repository(db: IDatabase = Depends(get_db)) -> EmployeeRepository:
    return EmployeeRepository(db)


def product_repository(db: IDatabase = Depends(get_db)) -> ProductRepository:
    return ProductRepository(db)


def store_product_repository(db: IDatabase = Depends(get_db)) -> StoreProductRepository:
    return StoreProductRepository(db)


def check_repository(db: IDatabase = Depends(get_db)) -> CheckRepository:
    return CheckRepository(db)


def user_repository(db: IDatabase = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def permission_repository(
    db: IDatabase = Depends(get_db),
) -> PermissionRepository:
    return PermissionRepository(db)


def user_group_repository(
    db: IDatabase = Depends(get_db),
) -> UserGroupRepository:
    return UserGroupRepository(db)


def group_permission_repository(
    db: IDatabase = Depends(get_db),
) -> GroupPermissionRepository:
    return GroupPermissionRepository(db)


def group_repository(db: IDatabase = Depends(get_db)) -> GroupRepository:
    return GroupRepository(db)


def customer_card_repository(db: IDatabase = Depends(get_db)) -> CustomerCardRepository:
    return CustomerCardRepository(db)


def sale_repository(db: IDatabase = Depends(get_db)) -> SaleRepository:
    return SaleRepository(db)


# Controllers setup


def password_hasher() -> IHasher:
    return SHA256Hasher()


def token_generator() -> ITokenGenerator:
    return JWTTokenGenerator(settings.SECRET_KEY, "HS256", timedelta(minutes=120))


def login_controller(
    user_repo: UserRepository = Depends(user_repository),
    password_hasher: IHasher = Depends(password_hasher),
    token_generator: ITokenGenerator = Depends(token_generator),
) -> LoginController:
    return LoginController(user_repo, password_hasher, token_generator)


def registration_controller(
    user_repo: UserRepository = Depends(user_repository),
    password_hasher: IHasher = Depends(password_hasher),
) -> RegistrationController:
    return RegistrationController(user_repo, password_hasher)


def user_permission_controller(
    permission_repo: PermissionRepository = Depends(permission_repository),
    user_group_repo: UserGroupRepository = Depends(user_group_repository),
    group_permission_repo: GroupPermissionRepository = Depends(
        group_permission_repository,
    ),
) -> UserPermissionController:
    return UserPermissionController(
        permission_repo, user_group_repo, group_permission_repo
    )


def user_group_controller(
    group_repo: GroupRepository = Depends(group_repository),
    user_group_repo: UserGroupRepository = Depends(user_group_repository),
    group_permission_repo: GroupPermissionRepository = Depends(
        group_permission_repository
    ),
) -> UserGroupController:
    return UserGroupController(group_repo, user_group_repo, group_permission_repo)


def category_query_controller(
    category_repo: CategoryRepository = Depends(category_repository),
) -> CategoryQueryController:
    return CategoryQueryController(category_repo)


def category_modification_controller(
    category_repo: CategoryRepository = Depends(category_repository),
) -> CategoryModificationController:
    return CategoryModificationController(category_repo)


def customer_card_query_controller(
    customer_card_repo: CustomerCardRepository = Depends(customer_card_repository),
) -> CustomerCardQueryController:
    return CustomerCardQueryController(customer_card_repo)


def customer_card_modification_controller(
    customer_card_repo: CustomerCardRepository = Depends(customer_card_repository),
) -> CustomerCardModificationController:
    return CustomerCardModificationController(customer_card_repo)


def user_cashier_permission_controller(
    user_perm_controller: UserPermissionController = Depends(
        user_permission_controller
    ),
    user_group_controller: UserGroupController = Depends(user_group_controller),
    group_repo: GroupRepository = Depends(group_repository),
    user_group_repo: UserGroupRepository = Depends(user_group_repository),
    group_perm_repo: GroupPermissionRepository = Depends(group_permission_repository),
) -> UserCashierPermissionController:
    return UserCashierPermissionController(
        user_perm_controller,
        user_group_controller,
        group_repo,
        user_group_repo,
        group_perm_repo,
    )


def user_manager_permission_controller(
    user_perm_controller: UserPermissionController = Depends(
        user_permission_controller
    ),
    user_group_controller: UserGroupController = Depends(user_group_controller),
    group_repo: GroupRepository = Depends(group_repository),
    user_group_repo: UserGroupRepository = Depends(user_group_repository),
    group_perm_repo: GroupPermissionRepository = Depends(group_permission_repository),
) -> UserManagerPermissionController:
    return UserManagerPermissionController(
        user_perm_controller,
        user_group_controller,
        group_repo,
        user_group_repo,
        group_perm_repo,
    )


def user_employee_permission_controller(
    cashier_controller: UserCashierPermissionController = Depends(
        user_cashier_permission_controller
    ),
    manager_controller: UserManagerPermissionController = Depends(
        user_manager_permission_controller
    ),
    user_repo: UserRepository = Depends(user_repository),
    employee_repo: EmployeeRepository = Depends(employee_repository),
) -> UserEmployeePermissionController:
    return UserEmployeePermissionController(
        cashier_controller, manager_controller, user_repo, employee_repo
    )


def check_query_controller(
    check_repo: CheckRepository = Depends(check_repository),
    customer_card_repo: CustomerCardRepository = Depends(customer_card_repository),
    store_product_repo: StoreProductRepository = Depends(store_product_repository),
    sale_repo: SaleRepository = Depends(sale_repository),
) -> CheckQueryController:
    return CheckQueryController(
        check_repo, customer_card_repo, store_product_repo, sale_repo
    )


def check_modification_controller(
    check_repo: CheckRepository = Depends(check_repository),
    customer_card_repo: CustomerCardRepository = Depends(customer_card_repository),
    store_product_repo: StoreProductRepository = Depends(store_product_repository),
    sale_repo: SaleRepository = Depends(sale_repository),
) -> CheckModificationController:
    return CheckModificationController(
        check_repo, customer_card_repo, store_product_repo, sale_repo
    )


def check_cleanup_controller(
    check_repo: CheckRepository = Depends(check_repository),
    customer_card_repo: CustomerCardRepository = Depends(customer_card_repository),
    store_product_repo: StoreProductRepository = Depends(store_product_repository),
    sale_repo: SaleRepository = Depends(sale_repository),
) -> CheckCleanupController:
    return CheckCleanupController(
        check_repo, customer_card_repo, store_product_repo, sale_repo
    )


def employee_query_controller(
    employee_repo: EmployeeRepository = Depends(employee_repository),
) -> EmployeeQueryController:
    return EmployeeQueryController(employee_repo)


def employee_modification_controller(
    employee_repo: EmployeeRepository = Depends(employee_repository),
    perm_controller: UserEmployeePermissionController = Depends(
        user_employee_permission_controller
    ),
) -> EmployeeModificationController:
    return EmployeeModificationController(employee_repo, perm_controller)
