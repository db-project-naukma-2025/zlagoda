from pydantic import BaseModel, ConfigDict, Field, SecretStr

from ._base import UNSET, UnsetAnnotated


class User(BaseModel):
    id: int
    username: str
    password: SecretStr  # meant to be hashed
    is_superuser: bool = False


class PermissionCreate(BaseModel):
    model_name: str
    codename: str

    model_config = ConfigDict(frozen=True)


class Permission(PermissionCreate):
    id: int

    model_config = ConfigDict(frozen=True)


class PermissionUpdate(BaseModel):
    model_name: str | UnsetAnnotated = Field(default=UNSET)
    codename: str | UnsetAnnotated = Field(default=UNSET)

    model_config = ConfigDict(frozen=True)


class Group(BaseModel):
    id: int
    name: str
    permissions: list[Permission]


class UserGroup(BaseModel):
    user_id: int
    group_id: int

    model_config = ConfigDict(frozen=True)


class GroupPermission(BaseModel):
    group_id: int
    permission_id: int

    model_config = ConfigDict(frozen=True)
