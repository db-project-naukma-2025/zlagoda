from pydantic import BaseModel, SecretStr


class User(BaseModel):
    id: int
    username: str
    password: SecretStr  # meant to be hashed
    is_superuser: bool = False


class Permission(BaseModel):
    id: int
    model_name: str
    codename: str


class Group(BaseModel):
    id: int
    name: str
    permissions: list[Permission]


class UserGroup(BaseModel):
    user_id: int
    group_id: int


class GroupPermission(BaseModel):
    group_id: int
    permission_id: int
