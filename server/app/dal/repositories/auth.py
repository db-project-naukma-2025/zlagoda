import structlog
from pydantic import SecretStr

from ..schemas._base import UNSET
from ..schemas.auth import (
    Group,
    GroupPermission,
    Permission,
    PermissionCreate,
    PermissionUpdate,
    User,
    UserGroup,
)
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class UserRepository(PydanticDBRepository[User]):
    table_name = "auth_user"
    model = User

    def create(self, username: str, password: SecretStr, is_superuser: bool) -> User:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (username, password, is_superuser)
                VALUES (%s, %s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (username, password.get_secret_value(), is_superuser),
        )
        return self._row_to_model(rows[0])

    def update(
        self,
        user_id: int,
        username: str | None,
        password: str | None,
        is_superuser: bool | None,
    ) -> User:
        if username is None and password is None and is_superuser is None:
            raise ValueError("At least one field must be provided")

        set_clauses = []
        params = []

        if username is not None:
            set_clauses.append("username = %s")
            params.append(username)
        if password is not None:
            set_clauses.append("password = %s")
            params.append(password)
        if is_superuser is not None:
            set_clauses.append("is_superuser = %s")
            params.append(is_superuser)

        set_clause = ", ".join(set_clauses)

        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET {set_clause}
                WHERE id = %s
                RETURNING {", ".join(self._fields)}
            """,
            (*params, user_id),
        )
        return self._row_to_model(rows[0])

    def get_by_username(self, username: str) -> User | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE username = %s
            """,
            (username,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def delete(self, user_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE id = %s
            """,
            (user_id,),
        )


class PermissionRepository(PydanticDBRepository[Permission]):
    table_name = "auth_permission"
    model = Permission
    pk_field = "id"

    def get_all(self) -> list[Permission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def search(
        self,
        permission: PermissionUpdate | None = None,
        /,
    ) -> list[Permission]:
        clauses, params = self._construct_clauses(
            self._fields,
            permission,
            exclude_fields=[self.pk_field],
        )

        where_clause = "WHERE " + " AND ".join(clauses) if clauses else ""

        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                {where_clause}
            """,
            tuple(params),
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, permission: PermissionCreate) -> Permission:
        fields = list(self._fields)
        fields.remove(self.pk_field)

        params = []
        for field in fields:
            value = getattr(permission, field, UNSET)
            if value is UNSET:
                continue
            params.append(value)

        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} ({", ".join(fields)})
                VALUES ({", ".join(["%s" for _ in fields])})
                RETURNING {", ".join(self._fields)}
            """,
            tuple(params),
        )
        return self._row_to_model(rows[0])

    def delete(self, permission_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE {self.pk_field} = %s
            """,
            (permission_id,),
        )


class GroupRepository(PydanticDBRepository[Group]):
    table_name = "auth_group"
    model = Group

    def get_all(self) -> list[Group]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def get_by_name(self, name: str) -> Group | None:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE name = %s
            """,
            (name,),
        )
        return self._row_to_model(rows[0]) if rows else None

    def create(self, name: str) -> Group:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (name)
                VALUES (%s)
                RETURNING {", ".join(self._fields)}
            """,
            (name,),
        )
        return self._row_to_model(rows[0])

    def delete(self, group_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE id = %s
            """,
            (group_id,),
        )


class UserGroupRepository(PydanticDBRepository[UserGroup]):
    table_name = "auth_user_groups"
    model = UserGroup

    def get_all(self) -> list[UserGroup]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, user_id: int, group_id: int) -> UserGroup:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (user_id, group_id)
                VALUES (%s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (user_id, group_id),
        )
        return self._row_to_model(rows[0])

    def delete(self, user_id: int, group_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE user_id = %s AND group_id = %s
            """,
            (user_id, group_id),
        )

    def get_user_groups(self, user_id: int) -> list[UserGroup]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE user_id = %s
            """,
            (user_id,),
        )
        return [self._row_to_model(row) for row in rows]

    def get_group_users(self, group_id: int) -> list[UserGroup]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE group_id = %s
            """,
            (group_id,),
        )
        return [self._row_to_model(row) for row in rows]


class GroupPermissionRepository(PydanticDBRepository[GroupPermission]):
    table_name = "auth_group_permissions"
    model = GroupPermission

    def get_all(self) -> list[GroupPermission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, group_id: int, permission_id: int) -> GroupPermission:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (group_id, permission_id)
                VALUES (%s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (group_id, permission_id),
        )
        return self._row_to_model(rows[0])

    def delete(self, group_id: int, permission_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE group_id = %s AND permission_id = %s
            """,
            (group_id, permission_id),
        )

    def get_group_permissions(self, group_id: int) -> list[GroupPermission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE group_id = %s
            """,
            (group_id,),
        )
        return [self._row_to_model(row) for row in rows]

    def get_permission_groups(self, permission_id: int) -> list[GroupPermission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE permission_id = %s
            """,
            (permission_id,),
        )
        return [self._row_to_model(row) for row in rows]
