import { type AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";

import { FieldError } from "@/components/common/field-error";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type StoreProduct } from "@/lib/api/store-products/types";

const RequiredIndicator = () => <span className="text-red-500">*</span>;

interface SimpleProduct {
  id_product: number;
  product_name: string;
  category_number: number;
}

interface StoreProductFormFieldsProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  products: SimpleProduct[];
  storeProducts?: StoreProduct[];
  isCreate?: boolean;
  currentUPC?: string;
  initialData?: {
    selling_price?: number;
    promotional_product?: boolean;
  };
}

export function StoreProductFormFields({
  form,
  products,
  isCreate = false,
  initialData,
}: StoreProductFormFieldsProps) {
  const [watchedSellingPrice, setWatchedSellingPrice] = useState<number>(0);

  useEffect(() => {
    if (initialData?.selling_price) {
      setWatchedSellingPrice(Number(initialData.selling_price));
    }
  }, [initialData]);

  const isPromotional = initialData?.promotional_product ?? false;

  return (
    <div className="space-y-4">
      {isCreate && (
        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                UPC <RequiredIndicator />
              </Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="e.g., 123456789012"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="UPC"
        />
      )}

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Product <RequiredIndicator />
            </Label>
            <Combobox
              emptyMessage="No products found."
              options={[
                ...products
                  .filter((p) => p.id_product)
                  .map((product) => ({
                    value: product.id_product.toString(),
                    label: product.product_name,
                    searchText: product.product_name,
                  })),
              ]}
              placeholder="e.g., Organic Whole Milk"
              searchPlaceholder="Search for products..."
              value={
                field.state.value && field.state.value !== 0
                  ? String(field.state.value)
                  : ""
              }
              onValueChange={(value: string) => {
                field.handleChange(Number(value));
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="id_product"
      />

      <form.Field
        children={(field) => {
          const currentPrice = Number(field.state.value ?? 0);
          if (currentPrice !== watchedSellingPrice && currentPrice > 0) {
            setWatchedSellingPrice(currentPrice);
          }

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Selling Price <RequiredIndicator />
              </Label>
              <Input
                disabled={isPromotional}
                id={field.name}
                min="0"
                name={field.name}
                placeholder="e.g., 25.50"
                step="0.01"
                type="number"
                value={String(field.state.value ?? "")}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  if (!isPromotional) {
                    const value = e.target.value ? Number(e.target.value) : 0;
                    field.handleChange(value);
                    setWatchedSellingPrice(value);
                  }
                }}
              />
              {isPromotional && (
                <p className="text-sm text-muted-foreground">
                  Price is automatically set to 80% of the regular product
                  price. To change this, update the price on the regular
                  product.
                </p>
              )}
              <FieldError field={field} />
            </div>
          );
        }}
        name="selling_price"
      />

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Stock Quantity <RequiredIndicator />
            </Label>
            <Input
              id={field.name}
              min="0"
              name={field.name}
              placeholder="e.g., 100"
              type="number"
              value={String(field.state.value ?? "")}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value ? Number(e.target.value) : 0);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="products_number"
      />
    </div>
  );
}

interface PromotionalProductFormFieldsProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  maxUnits: number;
  onUnitsChange?: (units: number) => void;
  onOperationTypeChange?: (operationType: "convert" | "add") => void;
}

export function PromotionalProductFormFields({
  form,
  maxUnits,
  onUnitsChange,
  onOperationTypeChange,
}: PromotionalProductFormFieldsProps) {
  return (
    <div className="space-y-4">
      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Promotional Product UPC <RequiredIndicator />
            </Label>
            <Input
              id={field.name}
              placeholder="e.g., 123456789013"
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="promotional_UPC"
      />

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Operation Type <RequiredIndicator />
            </Label>
            <Combobox
              emptyMessage="No operation types found."
              options={[
                {
                  value: "convert",
                  label: "Convert Units",
                  searchText: "Convert units from regular to promotional",
                },
                {
                  value: "add",
                  label: "Add New Units",
                  searchText:
                    "Add new promotional units without reducing regular stock",
                },
              ]}
              placeholder="Select operation type"
              searchPlaceholder="Search operation types..."
              value={field.state.value as string}
              onValueChange={(value: string) => {
                const operationType = value as "convert" | "add";
                field.handleChange(operationType);
                onOperationTypeChange?.(operationType);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Convert: Move units from regular to promotional • Add: Create new
              promotional units
            </p>
            <FieldError field={field} />
          </div>
        )}
        name="operation_type"
      />

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Units <RequiredIndicator />
            </Label>
            <Input
              id={field.name}
              min="1"
              placeholder="e.g., 10"
              type="number"
              value={String(field.state.value ?? "")}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : 0;
                field.handleChange(value);
                onUnitsChange?.(value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              {maxUnits === Infinity
                ? "Enter the number of promotional units to create"
                : `Available: ${maxUnits.toLocaleString()} units`}
            </p>
            <FieldError field={field} />
          </div>
        )}
        name="units"
      />
    </div>
  );
}
