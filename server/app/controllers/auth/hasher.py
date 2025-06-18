import hashlib
from typing import Protocol

from ...decorators import implements


class IHasher(Protocol):
    def get_hash(self, value: str) -> str: ...

    def verify(self, value: str, hash_value: str) -> bool: ...


class SHA256Hasher(IHasher):
    @implements
    def get_hash(self, value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()

    @implements
    def verify(self, value: str, hash_value: str) -> bool:
        return self.get_hash(value) == hash_value
