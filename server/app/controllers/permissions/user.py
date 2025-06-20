from enum import Enum
from typing import Generator, Type

from pydantic import BaseModel

from ...dal.repositories.auth import (
    GroupPermissionRepository,
    PermissionRepository,
    UserGroupRepository,
)
from ...dal.schemas.auth import Permission, PermissionCreate, PermissionUpdate, User


class BasicPermission(Enum):
    VIEW = "view"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


class UserPermissionController:
    def __init__(
        self,
        permission_repo: PermissionRepository,
        user_group_repo: UserGroupRepository,
        group_permission_repo: GroupPermissionRepository,
    ):
        self.permission_repo = permission_repo
        self.user_group_repo = user_group_repo
        self.group_permission_repo = group_permission_repo
        self._model_name_cache: dict[str, set[Permission]] = {}

    def _get_codename(self, model_name: str, perm_name: BasicPermission | str) -> str:
        if isinstance(perm_name, str):
            suffix = perm_name
        elif isinstance(perm_name, BasicPermission):
            suffix = f"can_{perm_name.value}"
        else:
            raise ValueError(f"Invalid permission name: {perm_name}")
        return f"{model_name.lower()}.{suffix}"

    def _has_all_permissions(self, user: User) -> bool:
        return user.is_superuser

    def create_basic_permissions(
        self, model_name: str | type
    ) -> tuple[set[Permission], bool]:
        """Create basic permissions for a model.

        Args:
            model_name (str | type): The name of the model to create permissions for.

        Returns:
            tuple[set[Permission], bool]: permissions, any were created
        """

        if isinstance(model_name, type):
            model_name = model_name.__name__

        if model_name in self._model_name_cache:
            return self._model_name_cache[model_name], False

        basic_permissions: set[Permission] = set()

        existing = self.permission_repo.search(PermissionUpdate(model_name=model_name))
        basic_permissions.update(set(existing))

        existing_basic_codenames = {perm.codename for perm in existing}

        missing = [
            perm
            for perm in BasicPermission
            if self._get_codename(model_name, perm) not in existing_basic_codenames
        ]

        if not missing:
            return basic_permissions, False

        for perm_name in missing:
            # TODO: add check if permission already exists
            perm = self.permission_repo.create(
                PermissionCreate(
                    model_name=model_name,
                    codename=self._get_codename(model_name, perm_name),
                )
            )
            basic_permissions.add(perm)

        self._model_name_cache[model_name] = basic_permissions
        return basic_permissions, True

    def has_permission(self, user: User, permission: Permission) -> bool:
        if self._has_all_permissions(user):
            return True

        permissions, _ = self.create_basic_permissions(permission.model_name)
        if permission not in permissions:
            return False

        user_groups = self.user_group_repo.get_user_groups(user.id)

        for group in user_groups:
            group_permissions = self.group_permission_repo.get_group_permissions(
                group.group_id
            )

            if any(perm.permission_id == permission.id for perm in group_permissions):
                return True

        return False

    def has_model_permission(
        self, user: User, model: Type[BaseModel], name: str | BasicPermission
    ) -> bool:
        if self._has_all_permissions(user):
            return True

        name = self._get_codename(model.__name__, name)

        perm = self.permission_repo.search(
            PermissionUpdate(model_name=model.__name__, codename=name)
        )
        if not perm:
            return False

        if len(perm) > 1:
            raise ValueError(
                f"Multiple permissions found for {model.__name__} with codename {name}"
            )

        return self.has_permission(user, perm[0])

    def get_or_create_perm(
        self, model_name: str | Type[BaseModel], name: str | BasicPermission
    ) -> Permission:
        if isinstance(model_name, type):
            model_name = model_name.__name__

        name = self._get_codename(model_name, name)

        perms = self.permission_repo.search(
            PermissionUpdate(model_name=model_name, codename=name)
        )
        if perms:
            return perms[0]

        return self.permission_repo.create(
            PermissionCreate(model_name=model_name, codename=name)
        )

    def get_all_permissions(self, user: User) -> Generator[Permission, None, None]:
        if self._has_all_permissions(user):
            yield from self.permission_repo.get_all()
            return

        user_groups = self.user_group_repo.get_user_groups(user.id)
        for group in user_groups:
            group_permissions = self.group_permission_repo.get_group_permissions(
                group.group_id
            )
            for group_perm in group_permissions:
                perm = self.permission_repo.get(group_perm.permission_id)
                yield perm
