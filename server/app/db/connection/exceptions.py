class DatabaseError(Exception):
    """Base class for database-related errors."""

    pass


class IntegrityError(DatabaseError):
    """
    Base class for integrity errors.

    Raised when a database operation violates data integrity rules, such as attempting
    to insert a duplicate primary key, violating a unique constraint, or failing
    a foreign key constraint.
    """

    pass


class DataError(DatabaseError):
    """
    Base class for data errors.

    Raised when a database operation encounters invalid or inappropriate data, such as
    attempting to insert a value that violates a data type constraint or is outside
    the valid range.
    """
