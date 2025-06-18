from ...dal.repositories.auth import UserRepository
from ...dal.schemas.auth import User
from .exceptions import InvalidCredentialsError, UserNotFoundError
from .hasher import IHasher


class LoginController:
    def __init__(self, user_repo: UserRepository, password_hasher: IHasher):
        self.user_repo = user_repo
        self.password_hasher = password_hasher

    def login(self, username: str, password: str) -> User:
        user = self.user_repo.get_by_username(username)
        if user is None:
            raise UserNotFoundError("User not found")

        if not self.password_hasher.verify(password, user.password):
            raise InvalidCredentialsError("Invalid password")

        return user
