import hashlib
from typing import Protocol

from pydantic import SecretStr

from ...decorators import implements


class IHasher(Protocol):
    def get_hash(self, value: str) -> str: ...

    def verify(self, value: str, hash_value: str | SecretStr) -> bool: ...


class SHA256Hasher(IHasher):
    # TODO: reimplement with bcrypt using salt
    @implements
    def get_hash(self, value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()

    @implements
    def verify(self, value: str, hash_value: str | SecretStr) -> bool:
        if isinstance(hash_value, SecretStr):
            hash_value = hash_value.get_secret_value()
        return self.get_hash(value) == hash_value
