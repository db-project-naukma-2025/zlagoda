import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
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
  type ProductId,
} from "@/lib/api/products/types";

import { BaseProductForm } from "./form";
import { type ProductWithId } from "./types";

export function CreateProductDialog({
  categories,
}: {
  categories: { category_number: number; category_name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateProduct();

  const form = useForm({
    defaultValues: {
      category_number: 0,
      product_name: "",
      characteristics: "",
    },
    validators: {
      onChange: createProductSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        toast.success("Product created successfully");
        form.reset();
        setOpen(false);
      } catch {
        toast.error("Failed to create product");
      }
    },
  });

  return (
    <FormDialog
      description="Add a new product to your catalog."
      isPending={createMutation.isPending}
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
  product: ProductWithId;
  categories: { category_number: number; category_name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateProduct();

  const form = useForm({
    defaultValues: {
      id_product: product.id_product,
      category_number: product.category_number,
      product_name: product.product_name,
      characteristics: product.characteristics,
    },
    validators: {
      onChange: updateProductSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: product.id_product,
          data: value,
        });
        toast.success("Product updated successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to update product");
      }
    },
  });

  return (
    <FormDialog
      description="Update the product information."
      isPending={updateMutation.isPending}
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

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(productId);
      toast.success("Product deleted successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this product? This action cannot be undone."
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Product"
      onConfirm={() => {
        void handleDelete();
      }}
      onOpenChange={onOpenChange}
    />
  );
}
