from datetime import datetime, timedelta, timezone
from typing import Protocol
from typing import cast as typecast

import jwt
from jwt.exceptions import InvalidTokenError as JWTInvalidTokenError

from ...decorators import implements
from .exceptions import InvalidTokenError


class ITokenGenerator(Protocol):
    def create_token(self, username: str) -> str: ...

    def retrieve_username(self, token: str | None) -> str: ...


class JWTTokenGenerator(ITokenGenerator):
    SUBJECT_KEY = "sub"
    EXPIRATION_KEY = "exp"

    def __init__(self, secret_key: str, algorithm: str, expires_delta: timedelta):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expires_delta = expires_delta

    @implements
    def create_token(self, username: str) -> str:
        payload = {
            self.SUBJECT_KEY: username,
            self.EXPIRATION_KEY: datetime.now(timezone.utc) + self.expires_delta,
        }
        try:
            return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        except Exception as e:
            raise ValueError(f"Failed to generate token: {e}")

    @implements
    def retrieve_username(self, token: str | None) -> str:
        if token is None:
            raise InvalidTokenError("Token is None")

        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
        except JWTInvalidTokenError as e:
            raise InvalidTokenError(f"Failed to retrieve username: {e}")

        now = datetime.now(timezone.utc)
        if typecast(int, payload.get(self.EXPIRATION_KEY)) < int(now.timestamp()):
            raise InvalidTokenError("Token expired")

        return payload.get(self.SUBJECT_KEY)
