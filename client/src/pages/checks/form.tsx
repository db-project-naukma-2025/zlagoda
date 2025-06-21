import { IconMinus, IconPlus } from "@tabler/icons-react";
import { type AnyFieldApi } from "@tanstack/react-form";
import { useMemo } from "react";

import { FieldError } from "@/components/common/field-error";
import { RequiredIndicator } from "@/components/common/required-indicator";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { type CreateSale } from "@/lib/api/checks/types";
import { type CustomerCard } from "@/lib/api/customer-cards/types";
import { type Product } from "@/lib/api/products/types";
import { type StoreProduct } from "@/lib/api/store-products/types";

interface CheckFormFieldsProps {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
  customerCards: CustomerCard[];
  storeProducts: StoreProduct[];
  products: Product[];
}

export function CheckFormFields({
  form,
  customerCards,
  storeProducts,
  products,
}: CheckFormFieldsProps) {
  const productLookup = useMemo(() => {
    return products.reduce<Record<number, Product>>((acc, product) => {
      acc[product.id_product] = product;
      return acc;
    }, {});
  }, [products]);

  return (
    <div className="space-y-6">
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
            <Label htmlFor={field.name}>Customer Card</Label>
            <Combobox
              className="w-full"
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
              value={(field.state.value as string) || ""}
              onValueChange={(value: string) => {
                field.handleChange(value || null);
              }}
            />
            <FieldError field={field} />
          </div>
        )}
        name="card_number"
      />

      <form.Field
        children={(salesField) => {
          return (
            <form.Field
              children={(cardField) => {
                const sales = salesField.state.value as CreateSale[];
                const cardNumberField = cardField.state.value as string | null;

                const selectedCard = customerCards.find(
                  (card) => card.card_number === cardNumberField,
                );
                const discountPercent = selectedCard?.percent ?? 0;

                const subtotal = sales.reduce((sum, sale) => {
                  const product = storeProducts.find((p) => p.UPC === sale.UPC);
                  if (product && sale.product_number > 0) {
                    return sum + product.selling_price * sale.product_number;
                  }
                  return sum;
                }, 0);

                const discountAmount = subtotal * (discountPercent / 100);
                const discountedAmount = subtotal - discountAmount;
                const vat = discountedAmount * 0.2;
                const total = discountedAmount;

                const addSale = () => {
                  salesField.handleChange([
                    ...sales,
                    { UPC: "", product_number: 1 },
                  ]);
                };

                const removeSale = (index: number) => {
                  if (sales.length > 1) {
                    salesField.handleChange(
                      sales.filter((_, i) => i !== index),
                    );
                  }
                };

                const updateSale = (
                  index: number,
                  saleField: keyof CreateSale,
                  value: string | number,
                ) => {
                  const newSales = [...sales];
                  newSales[index] = {
                    ...newSales[index],
                    [saleField]: value,
                  } as CreateSale;
                  salesField.handleChange(newSales);
                };

                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">
                        Sales Items <RequiredIndicator />
                      </Label>
                      <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        onClick={addSale}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {sales.map((sale, index) => (
                        <div
                          className="grid grid-cols-[1fr,auto,auto] gap-3 items-end p-4 border rounded-lg"
                          key={`sale-${String(index)}`}
                        >
                          <div className="space-y-2">
                            <Label>Product</Label>
                            <Combobox
                              className="w-full"
                              emptyMessage="No products found."
                              options={storeProducts
                                .filter(
                                  (storeProduct) =>
                                    storeProduct.products_number > 0,
                                )
                                .map((storeProduct) => {
                                  const product =
                                    productLookup[storeProduct.id_product];
                                  const productName =
                                    product?.product_name ?? "Unknown Product";

                                  return {
                                    value: storeProduct.UPC,
                                    label: `${productName} (${storeProduct.UPC}), Stock: ${String(storeProduct.products_number)}`,
                                    searchText: `${productName} ${storeProduct.UPC}`,
                                  };
                                })}
                              placeholder="Select product..."
                              searchPlaceholder="Search products..."
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
                              value={String(sale.product_number)}
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

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Order Summary</h3>
                      <div className="space-y-1 text-sm">
                        {discountPercent > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>₴{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Discount ({discountPercent}%):</span>
                              <span>-₴{discountAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total: ₴{total.toFixed(2)}</span>
                          <span>VAT: ₴{vat.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <FieldError field={salesField} />
                  </div>
                );
              }}
              name="card_number"
            />
          );
        }}
        name="sales"
      />

      {/* Hidden field for print_date */}
      <form.Field children={() => null} name="print_date" />
    </div>
  );
}
