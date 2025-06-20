import structlog
from pydantic import SecretStr

from ..schemas.auth import Group, GroupPermission, Permission, User, UserGroup
from ._base import PydanticDBRepository

logger = structlog.get_logger(__name__)


class UserRepository(PydanticDBRepository[User]):
    table_name = "auth_user"
    model = User

    def create(self, username: str, password: SecretStr, is_superuser: bool) -> User:
        """
        Create a new user with the specified username, password, and superuser status.
        
        Parameters:
        	username (str): The username for the new user.
        	password (SecretStr): The password for the new user.
        	is_superuser (bool): Whether the user has superuser privileges.
        
        Returns:
        	User: The created user instance.
        """
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
        """
        Update one or more fields of a user identified by user ID.
        
        At least one of `username`, `password`, or `is_superuser` must be provided; otherwise, a `ValueError` is raised.
        
        Parameters:
            user_id (int): The ID of the user to update.
            username (str | None): The new username, or None to leave unchanged.
            password (str | None): The new password, or None to leave unchanged.
            is_superuser (bool | None): The new superuser status, or None to leave unchanged.
        
        Returns:
            User: The updated user instance.
        """
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
        """
        Retrieve a user by their username.
        
        Returns:
            User instance if a user with the specified username exists, otherwise None.
        """
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

    def get_all(self) -> list[Permission]:
        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
            """,
        )
        return [self._row_to_model(row) for row in rows]

    def search(
        self, *, model_name: str | None = None, codename: str | None = None
    ) -> list[Permission]:
        if model_name is None and codename is None:
            raise ValueError("Either model_name or codename must be provided")

        where_clause = ""
        params = []

        if model_name:
            where_clause = "WHERE model_name = %s"
            params.append(model_name)
        elif codename:
            where_clause = "WHERE codename = %s"
            params.append(codename)

        rows = self._db.execute(
            f"""
                SELECT {", ".join(self._fields)}
                FROM {self.table_name}
                {where_clause}
            """,
            tuple(params),
        )
        return [self._row_to_model(row) for row in rows]

    def create(self, model_name: str, codename: str) -> Permission:
        rows = self._db.execute(
            f"""
                INSERT INTO {self.table_name} (model_name, codename)
                VALUES (%s, %s)
                RETURNING {", ".join(self._fields)}
            """,
            (model_name, codename),
        )
        return self._row_to_model(rows[0])

    def delete(self, permission_id: int) -> None:
        self._db.execute(
            f"""
                DELETE FROM {self.table_name}
                WHERE id = %s
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
