from typing import Literal

from pydantic import BaseModel

from ...dal.repositories.auth import UserRepository
from ...dal.schemas.auth import User, UserUpdate
from .exceptions import InvalidCredentialsError, UserNotFoundError
from .hasher import IHasher
from .token_generator import ITokenGenerator


class LoginResponse(BaseModel):
    user: User
    access_token: str
    token_type: Literal["bearer"]


class LoginController:
    def __init__(
        self,
        user_repo: UserRepository,
        password_hasher: IHasher,
        token_generator: ITokenGenerator,
    ):
        self.user_repo = user_repo
        self.password_hasher = password_hasher
        self.token_generator = token_generator

    def login(self, username: str, password: str) -> LoginResponse:
        users = self.user_repo.search(UserUpdate(username=username))
        if not users:
            raise UserNotFoundError("User not found")

        user = users[0]

        if not self.password_hasher.verify(password, user.password):
            raise InvalidCredentialsError("Invalid password")

        return LoginResponse(
            user=user,
            access_token=self.token_generator.create_token(username),
            token_type="bearer",
        )

    def get_user(self, access_token: str) -> User:
        username = self.token_generator.retrieve_username(access_token)
        users = self.user_repo.search(UserUpdate(username=username))
        if not users:
            raise UserNotFoundError("User not found")

        user = users[0]

        return user
