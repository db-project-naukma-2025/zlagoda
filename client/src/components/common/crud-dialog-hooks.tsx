import { useForm } from "@tanstack/react-form";
import { type UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

interface CreateDialogConfig<TFormData> {
  defaultValues: TFormData;
  schema: z.ZodSchema<TFormData>;
  createMutation: UseMutationResult<unknown, Error, TFormData>;
  successMessage?: string;
  errorMessage?: string;
  transformValue?: (value: TFormData) => TFormData;
}

export function useCreateDialog<TFormData>({
  defaultValues,
  schema,
  createMutation,
  successMessage = "Item created successfully",
  errorMessage = "Failed to create item",
  transformValue,
}: CreateDialogConfig<TFormData>) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues,
    validators: {
      onBlur: schema,
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        const transformedValue = transformValue ? transformValue(value) : value;
        await createMutation.mutateAsync(transformedValue);
        toast.success(successMessage);
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error(error);
        const apiErrorMessage = getApiErrorMessage(error, errorMessage);
        toast.error(apiErrorMessage);
      }
    },
  });

  // Custom setOpen that resets form on close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Dialog is being closed, reset the form
      form.reset();
    }
    setOpen(newOpen);
  };

  return {
    form,
    open,
    setOpen: handleOpenChange,
    isPending: createMutation.isPending,
  };
}

interface EditDialogConfig<TFormData, TItem, TId> {
  item: TItem;
  schema: z.ZodSchema<TFormData>;
  updateMutation: UseMutationResult<
    unknown,
    Error,
    { id: TId; data: TFormData }
  >;
  getDefaultValues: (item: TItem) => TFormData;
  successMessage?: string;
  errorMessage?: string;
  transformValue?: (value: TFormData) => TFormData;
  getId: (item: TItem) => TId;
  onSuccess?: () => void;
}

export function useEditDialog<TFormData, TItem, TId = string | number>({
  item,
  schema,
  updateMutation,
  getDefaultValues,
  successMessage = "Item updated successfully",
  errorMessage = "Failed to update item",
  transformValue,
  getId,
  onSuccess,
}: EditDialogConfig<TFormData, TItem, TId>) {
  const form = useForm({
    defaultValues: getDefaultValues(item),
    validators: {
      onBlur: schema,
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        const transformedValue = transformValue ? transformValue(value) : value;
        await updateMutation.mutateAsync({
          id: getId(item),
          data: transformedValue,
        });
        toast.success(successMessage);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error(error);
        const apiErrorMessage = getApiErrorMessage(error, errorMessage);
        toast.error(apiErrorMessage);
      }
    },
  });

  return {
    form,
    isPending: updateMutation.isPending,
  };
}

interface DeleteDialogConfig<TId = string | number> {
  deleteMutation: UseMutationResult<unknown, Error, TId>;
  successMessage?: string;
  errorMessage?: string;
}

export function useDeleteDialog<TId = string | number>({
  deleteMutation,
  successMessage = "Item deleted successfully",
  errorMessage = "Failed to delete item",
}: DeleteDialogConfig<TId>) {
  const handleDelete = async (
    id: TId,
    onOpenChange: (open: boolean) => void,
  ) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const apiErrorMessage = getApiErrorMessage(error, errorMessage);
      toast.error(apiErrorMessage);
    }
  };

  return {
    handleDelete,
    isPending: deleteMutation.isPending,
  };
}
