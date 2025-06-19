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
            <Label htmlFor={field.name}>Category</Label>
            <Select
              value={
                (field.state.value as number | undefined)?.toString() ?? ""
              }
              onValueChange={(value) => {
                field.handleChange(Number(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
            <Label htmlFor={field.name}>Product Name</Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="Enter product name"
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
            <Label htmlFor={field.name}>Characteristics</Label>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder="Enter product characteristics"
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
