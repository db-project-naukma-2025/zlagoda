# ruff: noqa: F401
from typing import Annotated, Any, Self

from pydantic import (
    GetCoreSchemaHandler,
    GetJsonSchemaHandler,
)
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing_extensions import final


@final
class Unset:
    """A type used as a sentinel for undefined values."""

    def __copy__(self) -> Self: """
Return self when a shallow copy of the Unset instance is requested.
"""
...
    def __deepcopy__(self, memo: Any) -> Self: """
Return self when a deep copy of the Unset sentinel is requested.

This ensures that the Unset sentinel remains a singleton even when deep-copied.
"""
...


UNSET = Unset()


class _UnsetPydanticAnnotation:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        """
        Constructs a Pydantic core schema for fields of type `Unset`, enforcing that only omitted fields or those explicitly set to `UNSET` are valid, and ensuring such fields are omitted from JSON serialization.
        
        Returns:
            core_schema.CoreSchema: A schema that defaults missing fields to `UNSET`, validates only `Unset` instances, and skips serialization of `UNSET` values in JSON output.
        """

        def validate_unset(value: Any) -> Unset:
            """
            Validates that the input value is an instance of Unset.
            
            Raises:
                ValueError: If the value is not an instance of Unset.
            Returns:
                Unset: The validated Unset instance.
            """
            if isinstance(value, Unset):
                return value
            # For any non-Unset value, we want validation to fail
            raise ValueError("Value must be Unset or field must be omitted")

        # Schema that only accepts Unset instances
        unset_instance_schema = core_schema.no_info_plain_validator_function(
            validate_unset
        )

        # Create a default schema that provides UNSET when field is missing
        schema = core_schema.with_default_schema(unset_instance_schema, default=UNSET)

        return core_schema.json_or_python_schema(
            json_schema=schema,
            python_schema=schema,
            # Custom serialization: skip UNSET values entirely
            serialization=core_schema.wrap_serializer_function_ser_schema(
                cls._serialize_unset,
                schema=core_schema.any_schema(),
                when_used="json",  # Only apply this serialization behavior for JSON
            ),
        )

    @staticmethod
    def _serialize_unset(value: Any, _info, nxt) -> Any:
        """
        Serialize values for Pydantic, omitting fields set to UNSET.
        
        If the value is an instance of Unset, returns a marker to instruct Pydantic to skip serializing this field; otherwise, delegates serialization to the next serializer.
        """
        if isinstance(value, Unset):
            # Return a special marker that Pydantic will recognize to skip this field
            # We can use core_schema.PydanticOmit for this purpose
            from pydantic_core import PydanticOmit

            return PydanticOmit
        return nxt(value)

    # * __get_pydantic_json_schema__ is intentionally omitted, as it adds `undefined` to the JSON schema


UnsetAnnotated = Annotated[Unset, _UnsetPydanticAnnotation]
