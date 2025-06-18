from ...dal.repositories.auth import (
    GroupPermissionRepository,
    GroupRepository,
    UserGroupRepository,
)
from ...dal.schemas.auth import Group, Permission, User


class UserGroupController:
    def __init__(
        self,
        group_repo: GroupRepository,
        user_group_repo: UserGroupRepository,
        group_permission_repo: GroupPermissionRepository,
    ):
        self.group_repo = group_repo
        self.user_group_repo = user_group_repo
        self.group_permission_repo = group_permission_repo

    def create_group(self, name: str) -> Group:
        return self.group_repo.create(name)

    def add_user_to_group(self, user: User, group: Group) -> None:
        user_group = self.user_group_repo.get_user_groups(user.id)
        if any(ug.group_id == group.id for ug in user_group):
            return

        self.user_group_repo.create(user.id, group.id)

    def add_permission_to_group(self, group: Group, permission: Permission) -> None:
        group_permission = self.group_permission_repo.get_group_permissions(group.id)
        if any(gp.permission_id == permission.id for gp in group_permission):
            return

        self.group_permission_repo.create(group.id, permission.id)

    def remove_user_from_group(self, user: User, group: Group) -> None:
        self.user_group_repo.delete(user.id, group.id)
