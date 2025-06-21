import { IconMinus, IconPlus } from "@tabler/icons-react";
import { type AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useState } from "react";

import { FieldError } from "@/components/common/field-error";
import { RequiredIndicator } from "@/components/common/required-indicator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type CustomerCard } from "@/lib/api/customer-cards/types";
import { type Employee } from "@/lib/api/employees/types";
import { type StoreProduct } from "@/lib/api/store-products/types";

interface CheckFormFieldsProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  employees: Employee[];
  customerCards: CustomerCard[];
  storeProducts: StoreProduct[];
}

interface Sale {
  UPC: string;
  product_number: number;
}

export function CheckFormFields({
  form,
  employees,
  customerCards,
  storeProducts,
}: CheckFormFieldsProps) {
  const [sales, setSales] = useState<Sale[]>([{ UPC: "", product_number: 1 }]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    vat: 0,
    total: 0,
    discount: 0,
  });

  // Calculate totals whenever sales change
  useEffect(() => {
    const subtotal = sales.reduce((sum, sale) => {
      const product = storeProducts.find((p) => p.UPC === sale.UPC);
      if (product && sale.product_number > 0) {
        return sum + product.selling_price * sale.product_number;
      }
      return sum;
    }, 0);

    const discount = 0; // Will be calculated based on customer card
    const discountedSubtotal = subtotal - discount;
    const vat = discountedSubtotal * 0.2;
    const total = discountedSubtotal + vat;

    setTotals({ subtotal, vat, total, discount });
  }, [sales, storeProducts]);

  const addSale = () => {
    setSales([...sales, { UPC: "", product_number: 1 }]);
  };

  const removeSale = (index: number) => {
    if (sales.length > 1) {
      setSales(sales.filter((_, i) => i !== index));
    }
  };

  const updateSale = (
    index: number,
    field: keyof Sale,
    value: string | number,
  ) => {
    const newSales = [...sales];
    newSales[index] = { ...newSales[index], [field]: value } as Sale;
    setSales(newSales);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Check Number <RequiredIndicator />
              </Label>
              <Input
                id={field.name}
                name={field.name}
                placeholder="e.g., 1234567890"
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="check_number"
        />

        <form.Field
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Employee <RequiredIndicator />
              </Label>
              <Combobox
                emptyMessage="No employees found."
                options={employees.map((employee) => ({
                  value: employee.id_employee,
                  label: `${employee.empl_surname} ${employee.empl_name}`,
                  searchText: `${employee.empl_surname} ${employee.empl_name} ${employee.id_employee}`,
                }))}
                placeholder="Select employee..."
                searchPlaceholder="Search employees..."
                value={field.state.value as string}
                onValueChange={(value: string) => {
                  field.handleChange(value);
                }}
              />
              <FieldError field={field} />
            </div>
          )}
          name="id_employee"
        />
      </div>

      <form.Field
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Customer Card</Label>
            <Combobox
              emptyMessage="No customer cards found."
              options={[
                { value: "", label: "No customer card" },
                ...customerCards.map((card) => ({
                  value: card.card_number,
                  label: `${card.cust_surname} ${card.cust_name} - ${card.card_number}`,
                  searchText: `${card.cust_surname} ${card.cust_name} ${card.card_number}`,
                })),
              ]}
              placeholder="Select customer card..."
              searchPlaceholder="Search customer cards..."
              value={field.state.value as string}
              onValueChange={(value: string) => {
                field.handleChange(value || null);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="card_number"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">
            Sales Items <RequiredIndicator />
          </Label>
          <Button size="sm" type="button" variant="outline" onClick={addSale}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {sales.map((sale, index) => (
            <div
              className="grid grid-cols-[1fr,auto,auto] gap-3 items-end p-4 border rounded-lg"
              key={index}
            >
              <div className="space-y-2">
                <Label>Product</Label>
                <Combobox
                  emptyMessage="No products found."
                  options={storeProducts
                    .filter((product) => product.products_number > 0)
                    .map((product) => ({
                      value: product.UPC,
                      label: `UPC: ${product.UPC} - Stock: ${String(product.products_number)}`,
                      searchText: product.UPC,
                    }))}
                  placeholder="Select product..."
                  searchPlaceholder="Search by UPC..."
                  value={sale.UPC}
                  onValueChange={(value: string) => {
                    updateSale(index, "UPC", value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  className="w-20"
                  min="1"
                  type="number"
                  value={sale.product_number}
                  onChange={(e) => {
                    updateSale(
                      index,
                      "product_number",
                      Number(e.target.value) || 1,
                    );
                  }}
                />
              </div>

              <Button
                disabled={sales.length <= 1}
                size="sm"
                type="button"
                variant="outline"
                onClick={() => {
                  removeSale(index);
                }}
              >
                <IconMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₴{totals.subtotal.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-₴{totals.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>VAT (20%):</span>
            <span>₴{totals.vat.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>₴{totals.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Hidden field to store sales data */}
      <form.Field children={() => null} name="sales" />

      {/* Hidden field for print_date */}
      <form.Field children={() => null} name="print_date" />
    </div>
  );
}
