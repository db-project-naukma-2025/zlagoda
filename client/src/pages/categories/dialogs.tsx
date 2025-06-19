import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/api/categories/hooks";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/api/categories/types";

import { CategoryForm } from "./form";

export interface CategoryWithId {
  category_number: number;
  category_name: string;
  id: number;
}

export function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCategory();

  const form = useForm({
    defaultValues: {
      category_name: "",
    },
    validators: {
      onChange: createCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        toast.success("Category created successfully");
        form.reset();
        setOpen(false);
      } catch {
        toast.error("Failed to create category");
      }
    },
  });

  return (
    <FormDialog
      description="Add a new category to organize your products."
      isPending={createMutation.isPending}
      open={open}
      submitText="Create"
      title="Create Category"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CategoryForm form={form} />
    </FormDialog>
  );
}

export function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateCategory();

  const form = useForm({
    defaultValues: {
      category_name: category.category_name,
    },
    validators: {
      onChange: updateCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: category.category_number,
          data: value,
        });
        toast.success("Category updated successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to update category");
      }
    },
  });

  return (
    <FormDialog
      description="Update the category information."
      isPending={updateMutation.isPending}
      key={`${category.category_number.toString()}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Category"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CategoryForm form={form} />
    </FormDialog>
  );
}

export function DeleteCategoryDialog({
  categoryId,
  open,
  onOpenChange,
}: {
  categoryId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = useDeleteCategory();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      toast.success("Category deleted successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this category? This action cannot be undone."
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Category"
      onConfirm={() => {
        void handleDelete();
      }}
      onOpenChange={onOpenChange}
    />
  );
}
