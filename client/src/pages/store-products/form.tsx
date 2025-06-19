import { type AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";

import { FieldError } from "@/components/common/field-error";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type StoreProductWithId } from "./types";

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
  storeProducts?: StoreProductWithId[];
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
              <Label htmlFor={field.name}>UPC</Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="Enter UPC code (max 12 characters)"
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
            <Label htmlFor={field.name}>Product</Label>
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
              placeholder="Select a product"
              searchPlaceholder="Search products..."
              value={
                field.state.value && field.state.value !== 0
                  ? String(field.state.value)
                  : ""
              }
              onValueChange={(value) => {
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
          // Update watched state when field value changes (including initial load)
          const currentPrice = Number(field.state.value ?? 0);
          if (currentPrice !== watchedSellingPrice && currentPrice > 0) {
            setWatchedSellingPrice(currentPrice);
          }

          return (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Selling Price</Label>
              <Input
                disabled={isPromotional}
                id={field.name}
                min="0"
                name={field.name}
                placeholder="Enter selling price"
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
            <Label htmlFor={field.name}>Stock Quantity</Label>
            <Input
              id={field.name}
              min="0"
              name={field.name}
              placeholder="Enter stock quantity"
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
}

export function PromotionalProductFormFields({
  form,
  maxUnits,
  onUnitsChange,
}: PromotionalProductFormFieldsProps) {
  return (
    <div className="space-y-4">
      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Promotional Product UPC</Label>
            <Input
              id={field.name}
              placeholder="Enter UPC for promotional product (12 characters)"
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
            <Label htmlFor={field.name}>Units to Convert</Label>
            <Input
              id={field.name}
              max={maxUnits}
              min="1"
              placeholder="Enter number of units"
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
              Available: {maxUnits} units
            </p>
            <FieldError field={field} />
          </div>
        )}
        name="units_to_convert"
      />
    </div>
  );
}
