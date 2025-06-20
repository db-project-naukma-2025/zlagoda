from abc import ABC, abstractmethod

from ...controllers.permissions import (
    BasicPermission,
    UserGroupController,
    UserPermissionController,
)
from ...dal.repositories.auth import (
    GroupPermissionRepository,
    GroupRepository,
    UserGroupRepository,
)
from ...dal.schemas import Group, User


class UserRoleController(ABC):
    @abstractmethod
    def get_role_name(self) -> str:
        pass

    @abstractmethod
    def get_permissions(self) -> list[tuple[type, BasicPermission]]:
        pass

    def __init__(
        self,
        perm_controller: UserPermissionController,
        group_controller: UserGroupController,
        group_repo: GroupRepository,
        user_group_repo: UserGroupRepository,
        group_perm_repo: GroupPermissionRepository,
    ):
        self.perm_controller = perm_controller
        self.group_controller = group_controller
        self.group_repo = group_repo
        self.user_group_repo = user_group_repo
        self.group_perm_repo = group_perm_repo

    def get_or_create_role(self) -> Group:
        group = self.group_repo.get_by_name(self.get_role_name())
        if not group:
            group = self.group_repo.create(self.get_role_name())

        perms = [
            self.perm_controller.get_or_create_perm(model, perm)
            for model, perm in self.get_permissions()
        ]

        for perm in perms:
            try:
                self.group_perm_repo.create(group.id, perm.id)
            except GroupPermissionRepository.AlreadyExists:
                pass

        return group

    def init_role(self) -> None:
        self.get_or_create_role()
        return None

    def assign_to_user(self, user: User) -> None:
        group = self.get_or_create_role()
        try:
            self.user_group_repo.create(user.id, group.id)
        except UserGroupRepository.AlreadyExists:
            pass

    def remove_from_user(self, user: User) -> None:
        group = self.get_or_create_role()
        self.user_group_repo.delete(user.id, group.id)
