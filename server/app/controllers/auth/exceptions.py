class AuthenticationError(Exception):
    pass


class InvalidCredentialsError(AuthenticationError):
    pass


class UserNotFoundError(AuthenticationError):
    pass


class UserAlreadyExistsError(AuthenticationError):
    pass
