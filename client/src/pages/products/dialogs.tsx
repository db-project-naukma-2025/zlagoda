import { IconPlus } from "@tabler/icons-react";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import {
  useCreateDialog,
  useDeleteDialog,
  useEditDialog,
} from "@/components/common/crud-dialog-hooks";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/lib/api/products/hooks";
import {
  createProductSchema,
  updateProductSchema,
  type Product,
  type ProductId,
} from "@/lib/api/products/types";

import { BaseProductForm } from "./form";

export function CreateProductDialog({
  categories,
}: {
  categories: { category_number: number; category_name: string }[];
}) {
  const createMutation = useCreateProduct();

  const { form, open, setOpen, isPending } = useCreateDialog({
    defaultValues: {
      category_number: 0,
      product_name: "",
      characteristics: "",
    },
    schema: createProductSchema,
    createMutation,
    successMessage: "Product created successfully",
    errorMessage: "Failed to create product",
  });

  return (
    <FormDialog
      description="Add a new product to your catalog."
      isPending={isPending}
      open={open}
      submitText="Create"
      title="Create Product"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <BaseProductForm categories={categories} form={form} />
    </FormDialog>
  );
}

export function EditProductDialog({
  product,
  categories,
  open,
  onOpenChange,
}: {
  product: Product;
  categories: { category_number: number; category_name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateProduct();

  const { form, isPending } = useEditDialog({
    item: product,
    schema: updateProductSchema,
    updateMutation,
    getDefaultValues: (prod) => ({
      id_product: prod.id_product,
      category_number: prod.category_number,
      product_name: prod.product_name,
      characteristics: prod.characteristics,
    }),
    getId: (prod) => prod.id_product,
    successMessage: "Product updated successfully",
    errorMessage: "Failed to update product",
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <FormDialog
      description="Update the product information."
      isPending={isPending}
      key={`${product.id_product.toString()}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Product"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <BaseProductForm categories={categories} form={form} />
    </FormDialog>
  );
}

export function DeleteProductDialog({
  productId,
  open,
  onOpenChange,
}: {
  productId: ProductId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = useDeleteProduct();

  const { handleDelete, isPending } = useDeleteDialog({
    deleteMutation,
    successMessage: "Product deleted successfully",
    errorMessage: "Failed to delete product",
  });

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this product? This action cannot be undone."
      isPending={isPending}
      open={open}
      title="Delete Product"
      onConfirm={() => {
        void handleDelete(productId, onOpenChange);
      }}
      onOpenChange={onOpenChange}
    />
  );
}
