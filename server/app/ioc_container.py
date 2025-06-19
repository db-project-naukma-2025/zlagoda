from typing import Generator

from fastapi import Depends

from . import settings
from .controllers.auth.hasher import IHasher, SHA256Hasher
from .controllers.auth.login import LoginController
from .controllers.auth.registration import RegistrationController
from .controllers.permissions.group import UserGroupController
from .controllers.permissions.permissions import UserPermissionController
from .dal.repositories.auth import (
    GroupPermissionRepository,
    GroupRepository,
    PermissionRepository,
    UserGroupRepository,
    UserRepository,
)
from .dal.repositories.category import CategoryRepository
from .dal.repositories.product import ProductRepository
from .dal.repositories.store_product import StoreProductRepository
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


def category_repository(db: IDatabase = Depends(get_db)) -> CategoryRepository:
    return CategoryRepository(db)


def product_repository(db: IDatabase = Depends(get_db)) -> ProductRepository:
    return ProductRepository(db)


def store_product_repository(db: IDatabase = Depends(get_db)) -> StoreProductRepository:
    return StoreProductRepository(db)


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


# Controllers setup


def password_hasher() -> IHasher:
    return SHA256Hasher()


def login_controller(
    user_repo: UserRepository = Depends(user_repository),
    password_hasher: IHasher = Depends(password_hasher),
) -> LoginController:
    return LoginController(user_repo, password_hasher)


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
