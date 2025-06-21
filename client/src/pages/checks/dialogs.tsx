import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategories } from "@/lib/api/categories/hooks";
import { useCreateCheck } from "@/lib/api/checks/hooks";
import {
  createCheckSchema,
  type Check,
  type CreateCheck,
} from "@/lib/api/checks/types";
import { useGetCustomerCards } from "@/lib/api/customer-cards/hooks";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { useGetProducts } from "@/lib/api/products/hooks";
import { useGetStoreProducts } from "@/lib/api/store-products/hooks";

import { CheckFormFields } from "./form";

interface ViewCheckDialogProps {
  check: Check | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeLookup: Record<string, string>;
  canViewEmployees: boolean;
}

export function ViewCheckDialog({
  check,
  open,
  onOpenChange,
  employeeLookup,
  canViewEmployees,
}: ViewCheckDialogProps) {
  const { data: storeProductsResponse } = useGetStoreProducts({ limit: 1000 });
  const { data: productsResponse } = useGetProducts({ limit: 1000 });
  const { data: categoriesResponse } = useGetCategories({ limit: 1000 });

  const storeProducts = useMemo(
    () => storeProductsResponse?.data ?? [],
    [storeProductsResponse?.data],
  );
  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse?.data],
  );
  const categories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse?.data],
  );

  const storeProductLookup = useMemo(() => {
    return storeProducts.reduce<
      Record<string, { id_product: number; selling_price: number }>
    >((acc, sp) => {
      acc[sp.UPC] = {
        id_product: sp.id_product,
        selling_price: sp.selling_price,
      };
      return acc;
    }, {});
  }, [storeProducts]);

  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<number, string>>((acc, category) => {
      acc[category.category_number] = category.category_name;
      return acc;
    }, {});
  }, [categories]);

  const productLookup = useMemo(() => {
    return products.reduce<
      Record<number, { name: string; category_name: string }>
    >((acc, product) => {
      acc[product.id_product] = {
        name: product.product_name,
        category_name:
          categoryLookup[product.category_number] ?? "Unknown Category",
      };
      return acc;
    }, {});
  }, [products, categoryLookup]);

  if (!check) return null;

  const employeeName = employeeLookup[check.id_employee] ?? check.id_employee;
  const printDate = new Date(check.print_date);
  const isLoading =
    !storeProductsResponse || !productsResponse || !categoriesResponse;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Check Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto max-h-full">
          <div className="space-y-6 pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Check Number
                </Label>
                <p className="text-lg font-mono">{check.check_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </Label>
                <p className="text-lg">
                  {format(printDate, "MMM dd, yyyy 'at' HH:mm")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {canViewEmployees && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Employee
                  </Label>
                  <p className="text-lg">{employeeName}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {check.id_employee}
                  </p>
                </div>
              )}
              <div className={canViewEmployees ? "" : "col-span-2"}>
                <Label className="text-sm font-medium text-muted-foreground">
                  Customer Card
                </Label>
                <p className="text-lg">
                  {check.card_number ? (
                    <span className="font-mono">{check.card_number}</span>
                  ) : (
                    <span className="text-muted-foreground">No card used</span>
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Items Purchased ({check.sales.length})
              </Label>
              <div className="mt-2 space-y-2">
                {check.sales.map((sale, index) => {
                  const storeProduct = storeProductLookup[sale.UPC];
                  const product = storeProduct
                    ? productLookup[storeProduct.id_product]
                    : null;

                  return (
                    <div
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      key={index}
                    >
                      <div className="flex-1 min-w-0">
                        {isLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium truncate">
                              {product?.name ?? "Unknown Product"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-mono">{sale.UPC}</span>
                              {product?.category_name && (
                                <>
                                  <span>•</span>
                                  <span>{product.category_name}</span>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-medium">
                          {sale.product_number} × ₴
                          {sale.selling_price.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₴
                          {(sale.product_number * sale.selling_price).toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  VAT
                </Label>
                <p className="text-lg font-medium">₴{check.vat.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </Label>
                <p className="text-2xl font-bold">
                  ₴{check.sum_total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function CreateCheckDialog() {
  const [open, setOpen] = useState(false);

  const createMutation = useCreateCheck();

  const { data: customerCardsResponse } = useGetCustomerCards({ limit: 1000 });
  const { data: storeProductsResponse } = useGetStoreProducts({ limit: 1000 });
  const { data: productsResponse } = useGetProducts({ limit: 1000 });

  const customerCards = useMemo(
    () => customerCardsResponse?.data ?? [],
    [customerCardsResponse?.data],
  );
  const storeProducts = useMemo(
    () => storeProductsResponse?.data ?? [],
    [storeProductsResponse?.data],
  );
  const products = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse?.data],
  );

  const form = useForm({
    defaultValues: {
      check_number: "",
      card_number: null as string | null,
      print_date: new Date().toISOString(),
      sales: [{ UPC: "", product_number: 1 }] as CreateCheck["sales"],
    },
    validators: {
      onSubmit: createCheckSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const checkData: CreateCheck = {
          ...value,
          print_date: new Date().toISOString(),
        };

        await createMutation.mutateAsync(checkData);

        toast.success("Check created successfully");
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error("Failed to create check:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to create check",
        );
        toast.error(errorMessage);
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  const isPending = createMutation.isPending;

  return (
    <FormDialog
      description="Create a new sales receipt with multiple items."
      isPending={isPending}
      open={open}
      submitText="Create Check"
      title="Create Sales Check"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          New Check
        </Button>
      }
      onOpenChange={handleOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CheckFormFields
        customerCards={customerCards}
        form={form}
        products={products}
        storeProducts={storeProducts}
      />
    </FormDialog>
  );
}
