from pydantic import BaseModel, ConfigDict, Field, SecretStr

from ._base import UNSET, UnsetAnnotated


class UserCreate(BaseModel):
    username: str
    password: str | SecretStr  # meant to be hashed
    is_superuser: bool = False


class User(UserCreate):
    id: int


class UserUpdate(BaseModel):
    username: str | UnsetAnnotated = Field(default=UNSET)
    password: str | SecretStr | UnsetAnnotated = Field(default=UNSET)
    is_superuser: bool | UnsetAnnotated = Field(default=UNSET)


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
