import { type AnyFieldApi } from "@tanstack/react-form";

import { FieldError } from "@/components/common/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const RequiredIndicator = () => <span className="text-red-500">*</span>;

interface BaseProductFormProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  categories: { category_number: number; category_name: string }[];
}

export function BaseProductForm({ form, categories }: BaseProductFormProps) {
  return (
    <div className="space-y-4">
      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Category <RequiredIndicator />
            </Label>
            <Select
              value={
                (field.state.value as number | undefined)?.toString() ?? ""
              }
              onValueChange={(value) => {
                field.handleChange(Number(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="e.g., Dairy Products" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.category_number}
                    value={category.category_number.toString()}
                  >
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError field={field} />
          </div>
        )}
        name="category_number"
      />

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Product Name <RequiredIndicator />
            </Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="e.g., Organic Whole Milk"
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="product_name"
      />

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Characteristics <RequiredIndicator />
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder="e.g., 1L, 3.5% fat, fresh, locally sourced"
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="characteristics"
      />
    </div>
  );
}
