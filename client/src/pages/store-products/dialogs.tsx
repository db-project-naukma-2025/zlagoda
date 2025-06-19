import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { schemas } from "@/generated/api";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import {
  useCreatePromotionalProduct,
  useCreateStoreProduct,
  useDeleteStoreProduct,
  useUpdateStoreProduct,
} from "@/lib/api/store-products/hooks";
import {
  createStoreProductSchema,
  updateStoreProductSchema,
  type CreatePromotionalProductFormData,
  type StoreProductUPC,
} from "@/lib/api/store-products/types";

import { PromotionalProductFormFields, StoreProductFormFields } from "./form";
import { type StoreProductWithId } from "./types";

// Simplified product interface for the form components
interface SimpleProduct {
  id_product: number;
  product_name: string;
  category_number: number;
}

interface CreateStoreProductDialogProps {
  products: SimpleProduct[];
  storeProducts?: StoreProductWithId[];
}

export function CreateStoreProductDialog({
  products,
  storeProducts = [],
}: CreateStoreProductDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateStoreProduct();

  const form = useForm({
    defaultValues: {
      UPC: "",
      UPC_prom: null as string | null,
      id_product: 0,
      selling_price: 0,
      products_number: 0,
      promotional_product: false, // Always false for regular product creation
    },
    validators: {
      onChange: createStoreProductSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // promotional_product is already set to false in defaultValues
        await createMutation.mutateAsync(value);
        toast.success("Store product created successfully");
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error("Failed to create store product:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to create store product",
        );
        toast.error(errorMessage);
      }
    },
  });

  return (
    <FormDialog
      description="Add a new product to store inventory."
      isPending={createMutation.isPending}
      open={open}
      submitText="Create"
      title="Create Store Product"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add to Inventory
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <StoreProductFormFields
        form={form}
        isCreate={true}
        products={products}
        storeProducts={storeProducts}
      />
    </FormDialog>
  );
}

interface EditStoreProductDialogProps {
  storeProduct: StoreProductWithId;
  products: SimpleProduct[];
  storeProducts?: StoreProductWithId[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditStoreProductDialog({
  storeProduct,
  products,
  storeProducts = [],
  open,
  onOpenChange,
}: EditStoreProductDialogProps) {
  const updateMutation = useUpdateStoreProduct();

  const form = useForm({
    defaultValues: {
      UPC_prom: storeProduct.UPC_prom,
      id_product: storeProduct.id_product,
      selling_price: storeProduct.selling_price,
      products_number: storeProduct.products_number,
      promotional_product: storeProduct.promotional_product,
    },
    validators: {
      onChange: updateStoreProductSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          upc: storeProduct.UPC,
          data: value,
        });
        toast.success("Store product updated successfully");
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update store product:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to update store product",
        );
        toast.error(errorMessage);
      }
    },
  });

  return (
    <FormDialog
      description="Update the store product information."
      isPending={updateMutation.isPending}
      key={`${storeProduct.UPC}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Store Product"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <StoreProductFormFields
        currentUPC={storeProduct.UPC}
        form={form}
        initialData={{
          selling_price: storeProduct.selling_price,
          promotional_product: storeProduct.promotional_product,
        }}
        products={products}
        storeProducts={storeProducts}
      />
    </FormDialog>
  );
}

interface DeleteStoreProductDialogProps {
  upc: StoreProductUPC;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteStoreProductDialog({
  upc,
  open,
  onOpenChange,
}: DeleteStoreProductDialogProps) {
  const deleteMutation = useDeleteStoreProduct();

  return (
    <ConfirmationDialog
      cancelText="Cancel"
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description={`Are you sure you want to delete store product with UPC "${upc}"? This action cannot be undone.`}
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Store Product"
      onConfirm={() => {
        void (async () => {
          try {
            await deleteMutation.mutateAsync(upc);
            toast.success("Store product deleted successfully");
            onOpenChange(false);
          } catch (error) {
            console.error("Failed to delete store product:", error);
            const errorMessage = getApiErrorMessage(
              error,
              "Failed to delete store product",
            );
            toast.error(errorMessage);
          }
        })();
      }}
      onOpenChange={onOpenChange}
    />
  );
}

interface CreatePromotionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceStoreProduct: StoreProductWithId;
  products: SimpleProduct[];
}

export function CreatePromotionalDialog({
  open,
  onOpenChange,
  sourceStoreProduct,
  products,
}: CreatePromotionalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promotionalUnitsValue, setPromotionalUnitsValue] = useState(1);
  const createPromotionalMutation = useCreatePromotionalProduct();

  const product = products.find(
    (p) => p.id_product === sourceStoreProduct.id_product,
  );

  const form = useForm({
    defaultValues: {
      units_to_convert: 1,
      promotional_UPC: "",
    } as CreatePromotionalProductFormData,
    validators: {
      onChange: schemas.CreatePromotionalProduct,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        await createPromotionalMutation.mutateAsync({
          sourceUpc: sourceStoreProduct.UPC,
          data: value,
        });

        toast.success("Promotional product created successfully");
        onOpenChange(false);
        form.reset();
        setPromotionalUnitsValue(1);
      } catch (error) {
        console.error("Failed to create promotional product:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to create promotional product",
        );
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const maxUnits = sourceStoreProduct.products_number;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Promotional Product</DialogTitle>
          <DialogDescription>
            Create a promotional version of {product?.product_name} with 20%
            discount. This will move units from the original product to the new
            promotional product.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Product</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="font-medium">{product?.product_name}</div>
                <div className="text-sm text-muted-foreground">
                  UPC: {sourceStoreProduct.UPC} • Stock:{" "}
                  {String(sourceStoreProduct.products_number)} units
                </div>
                <div className="text-sm text-muted-foreground">
                  Price: ₴{sourceStoreProduct.selling_price.toFixed(2)}
                </div>
              </div>
            </div>

            <PromotionalProductFormFields
              form={form}
              maxUnits={maxUnits}
              onUnitsChange={setPromotionalUnitsValue}
            />

            <div className="space-y-2">
              <Label>Promotional Product Preview</Label>
              <div className="p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
                <div className="flex justify-between text-sm">
                  <span>Original price:</span>
                  <span className="line-through">
                    ₴{sourceStoreProduct.selling_price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                  <span>Promotional price (20% discount):</span>
                  <span>
                    ₴{(sourceStoreProduct.selling_price * 0.8).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Units:</span>
                  <span>{String(promotionalUnitsValue)} units</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>After Conversion</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Original product stock:</span>
                    <span>
                      {String(
                        sourceStoreProduct.products_number -
                          promotionalUnitsValue,
                      )}{" "}
                      units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Promotional product stock:</span>
                    <span>{String(promotionalUnitsValue)} units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Promotional Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
