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
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/api/categories/hooks";
import {
  createCategorySchema,
  updateCategorySchema,
  type Category,
} from "@/lib/api/categories/types";

import { CategoryForm } from "./form";

export function CreateCategoryDialog() {
  const createMutation = useCreateCategory();

  const { form, open, setOpen, isPending } = useCreateDialog({
    defaultValues: {
      category_name: "",
    },
    schema: createCategorySchema,
    createMutation,
    successMessage: "Category created successfully",
    errorMessage: "Failed to create category",
  });

  return (
    <FormDialog
      description="Add a new category to organize your products."
      isPending={isPending}
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
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateCategory();

  const { form, isPending } = useEditDialog({
    item: category,
    schema: updateCategorySchema,
    updateMutation,
    getDefaultValues: (cat) => ({
      category_name: cat.category_name,
    }),
    getId: (cat) => cat.category_number,
    successMessage: "Category updated successfully",
    errorMessage: "Failed to update category",
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <FormDialog
      description="Update the category information."
      isPending={isPending}
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

  const { handleDelete, isPending } = useDeleteDialog({
    deleteMutation,
    successMessage: "Category deleted successfully",
    errorMessage: "Failed to delete category",
  });

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this category? This action cannot be undone."
      isPending={isPending}
      open={open}
      title="Delete Category"
      onConfirm={() => {
        void handleDelete(categoryId, onOpenChange);
      }}
      onOpenChange={onOpenChange}
    />
  );
}
