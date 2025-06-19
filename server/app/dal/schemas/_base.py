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

    def __copy__(self) -> Self: ...
    def __deepcopy__(self, memo: Any) -> Self: ...


UNSET = Unset()


class _UnsetPydanticAnnotation:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        """
        We return a pydantic_core.CoreSchema that behaves in the following ways:

        * If field is not provided in JSON/dict → set to UNSET
        * If field is explicitly set to UNSET → keep as UNSET
        * Any other value → validation fails
        * Serialization: UNSET values are skipped (not serialized)
        """

        def validate_unset(value: Any) -> Unset:
            """Validate that the value is an Unset instance, otherwise fail."""
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
        """Custom serializer that skips UNSET values."""
        if isinstance(value, Unset):
            # Return a special marker that Pydantic will recognize to skip this field
            # We can use core_schema.PydanticOmit for this purpose
            from pydantic_core import PydanticOmit

            return PydanticOmit
        return nxt(value)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        # For JSON schema, we want to indicate this field is optional and can be omitted
        return {"type": "null", "description": "Unset sentinel value - omit this field"}


UnsetAnnotated = Annotated[Unset, _UnsetPydanticAnnotation]
