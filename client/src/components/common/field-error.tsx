import { type AnyFieldApi } from "@tanstack/react-form";

interface FieldErrorProps {
  field: AnyFieldApi;
}

export function FieldError({ field }: FieldErrorProps) {
  if (!field.state.meta.errors.length) {
    return null;
  }

  return (
    <p className="text-sm font-medium text-destructive">
      {field.state.meta.errors
        .map((error: { message?: string } | string) =>
          typeof error === "string"
            ? error
            : (error.message ?? "Validation error"),
        )
        .join(", ")}
    </p>
  );
}
