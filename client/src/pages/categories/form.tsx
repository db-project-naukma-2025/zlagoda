import { type AnyFieldApi } from "@tanstack/react-form";

import { FieldError } from "@/components/common/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
}

export function CategoryForm({ form }: CategoryFormProps) {
  return (
    <form.Field
      children={(field) => {
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Category Name</Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="Enter category name"
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
            <FieldError field={field} />
          </div>
        );
      }}
      name="category_name"
    />
  );
}
