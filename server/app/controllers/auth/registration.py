from ...dal.repositories.auth import UserRepository
from ...dal.schemas.auth import User
from .exceptions import UserAlreadyExistsError
from .hasher import IHasher


class RegistrationController:
    def __init__(self, user_repo: UserRepository, password_hasher: IHasher):
        self.user_repo = user_repo
        self.password_hasher = password_hasher

    def exists(self, username: str) -> bool:
        return self.user_repo.get_by_username(username) is not None

    def register(
        self, username: str, password: str, *, is_superuser: bool = False
    ) -> User:
        if self.exists(username):
            raise UserAlreadyExistsError("User already exists")

        user = self.user_repo.create(
            username=username,
            password=self.password_hasher.get_hash(password),
            is_superuser=is_superuser,
        )
        return user
