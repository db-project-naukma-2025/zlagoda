from typing import overload

import structlog
from pydantic import SecretStr

from ...db.connection import DatabaseError, DataError, IntegrityError
from ..schemas._base import UNSET
from ..schemas.auth import (
    Group,
    GroupPermission,
    Permission,
    PermissionCreate,
    PermissionUpdate,
    User,
    UserCreate,
    UserGroup,
    UserUpdate,
)
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class UserRepository(PydanticDBRepository[User]):
    table_name = "auth_user"
    model = User
    pk_field = "id"

    class DoesNotExist(DatabaseError):
        pass

    class AlreadyExists(DatabaseError):
        pass

    @overload
    def _preprocess_user(self, user: UserCreate) -> UserCreate: ...

    @overload
    def _preprocess_user(self, user: UserUpdate) -> UserUpdate: ...

    def _preprocess_user(
        self, user: UserCreate | UserUpdate
    ) -> UserCreate | UserUpdate:
        if user.password is not UNSET and isinstance(user.password, SecretStr):
            user.password = user.password.get_secret_value()
        return user

    def create(self, user: UserCreate) -> User:
        user = self._preprocess_user(user)
        fields = list(self._fields)
        fields.remove(self.pk_field)

        params = []
        for field in fields:
            value = getattr(user, field, UNSET)
            if value is UNSET:
                continue
            params.append(value)

        try:
            rows = self._db.execute(
                f"""
                INSERT INTO {self.table_name} ({", ".join(fields)})
                VALUES ({", ".join(["%s" for _ in fields])})
                RETURNING {", ".join(self._fields)}
                """,
                tuple(params),
            )
        except IntegrityError as e:
            raise self.AlreadyExists from e
        except DataError as e:
            raise ValueError("invalid data") from e
        except DatabaseError as e:
            raise ValueError("database error") from e
        return self._row_to_model(rows[0])

    def update(
        self,
        user_id: int,
        user: UserUpdate,
    ) -> User:
        user = self._preprocess_user(user)
        clauses, params = self._construct_clauses(
            self._fields,
            user,
            exclude_fields=[self.pk_field],
        )

        if not clauses:
            raise ValueError("At least one field must be provided")

        rows = self._db.execute(
            f"""
                UPDATE {self.table_name}
                SET {", ".join(clauses)}
                WHERE {self.pk_field} = %s
                RETURNING {", ".join(self._fields)}
            """,
            tuple(params) + (user_id,),
        )
        return self._row_to_model(rows[0])

    def search(
        self,
        user: UserUpdate | None = None,
        /,
    ) -> list[User]:
        if user is not None:
            user = self._preprocess_user(user)

        clauses, params = self._construct_clauses(
            self._fields,
            user,
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

    class AlreadyExists(DatabaseError):
        pass

    def get_all(self) -> list[Permission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def get(self, permission_id: int) -> Permission:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE {self.pk_field} = %s
            """,
            (permission_id,),
        )
        return self._row_to_model(rows[0])

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

        try:
            rows = self._db.execute(
                f"""
                INSERT INTO {self.table_name} ({", ".join(fields)})
                VALUES ({", ".join(["%s" for _ in fields])})
                RETURNING {", ".join(self._fields)}
            """,
                tuple(params),
            )
            return self._row_to_model(rows[0])
        except IntegrityError as e:
            raise self.AlreadyExists from e
        except DataError as e:
            raise ValueError("invalid data") from e
        except DatabaseError as e:
            raise ValueError("database error") from e

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
    pk_field = "id"

    class AlreadyExists(DatabaseError):
        pass

    def get_all(self) -> list[Group]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def get_groups_by_ids(self, group_ids: list[int]) -> list[Group]:
        if not group_ids:
            return []

        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                WHERE {self.pk_field} IN ({", ".join(["%s" for _ in group_ids])})
            """,
            tuple(group_ids),
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
        try:
            rows = self._db.execute(
                f"""
                INSERT INTO {self.table_name} (name)
                VALUES (%s)
                RETURNING {", ".join(self._fields)}
            """,
                (name,),
            )
            return self._row_to_model(rows[0])
        except IntegrityError as e:
            raise self.AlreadyExists from e
        except DataError as e:
            raise ValueError("invalid data") from e
        except DatabaseError as e:
            raise ValueError("database error") from e

    def delete(self, group_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE {self.pk_field} = %s
            """,
            (group_id,),
        )


class UserGroupRepository(PydanticDBRepository[UserGroup]):
    table_name = "auth_user_groups"
    model = UserGroup

    class AlreadyExists(DatabaseError):
        pass

    def get_all(self) -> list[UserGroup]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, user_id: int, group_id: int) -> UserGroup:
        try:
            rows = self._db.execute(
                f"""
                INSERT INTO {self.table_name} (user_id, group_id)
                VALUES (%s, %s)
                RETURNING {", ".join(self._fields)}
            """,
                (user_id, group_id),
            )
            return self._row_to_model(rows[0])
        except IntegrityError as e:
            raise self.AlreadyExists from e
        except DataError as e:
            raise ValueError("invalid data") from e
        except DatabaseError as e:
            raise ValueError("database error") from e

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

    class AlreadyExists(DatabaseError):
        pass

    def get_all(self) -> list[GroupPermission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, group_id: int, permission_id: int) -> GroupPermission:
        try:
            rows = self._db.execute(
                f"""
                INSERT INTO {self.table_name} (group_id, permission_id)
                VALUES (%s, %s)
                RETURNING {", ".join(self._fields)}
            """,
                (group_id, permission_id),
            )
            return self._row_to_model(rows[0])
        except IntegrityError as e:
            raise self.AlreadyExists from e
        except DataError as e:
            raise ValueError("invalid data") from e
        except DatabaseError as e:
            raise ValueError("database error") from e

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
