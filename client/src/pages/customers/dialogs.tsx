import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateCustomerCard,
  useDeleteCustomerCard,
  useUpdateCustomerCard,
} from "@/lib/api/customer-cards/hooks";
import {
  baseCustomerCardSchema,
  createCustomerCardSchema,
  type UpdateCustomerCardFormData,
} from "@/lib/api/customer-cards/types";

import { CustomerCardForm } from "./form";
import { type CustomerCardWithId } from "./types";

/**
 * Converts empty string fields in customer card form data to `null` for nullable fields.
 *
 * Fields affected are `cust_patronymic`, `city`, `street`, and `zip_code`. Trims whitespace before checking for emptiness.
 *
 * @param value - The customer card form data to transform
 * @returns The transformed form data with empty strings replaced by `null` in nullable fields
 */
function transformValue<T extends UpdateCustomerCardFormData>(value: T): T {
  return {
    ...value,
    cust_patronymic:
      value.cust_patronymic?.trim() === "" ? null : value.cust_patronymic,
    city: value.city?.trim() === "" ? null : value.city,
    street: value.street?.trim() === "" ? null : value.street,
    zip_code: value.zip_code?.trim() === "" ? null : value.zip_code,
  };
}

/**
 * Displays a dialog for creating a new customer card with form validation and submission.
 *
 * Opens a modal form for entering customer details, validates input, transforms empty string fields to null where appropriate, and submits the data to create a new customer card. Shows success or error notifications and resets the form on successful creation.
 */
export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCustomerCard();

  const form = useForm({
    defaultValues: {
      card_number: "",
      cust_surname: "",
      cust_name: "",
      cust_patronymic: "" as string | null,
      phone_number: "",
      city: "" as string | null,
      street: "" as string | null,
      zip_code: "" as string | null,
      percent: 0,
    },
    validators: {
      onSubmit: createCustomerCardSchema,
    },
    onSubmit: async ({ value }) => {
      // Transform empty strings to null for nullable fields
      const transformedValue = transformValue(value);

      console.log(transformedValue);
      try {
        await createMutation.mutateAsync(transformedValue);
        toast.success("Customer created successfully");
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to create customer");
      }
    },
  });

  return (
    <FormDialog
      description="Add a new customer to the system."
      isPending={createMutation.isPending}
      open={open}
      submitText="Create"
      title="Create Customer"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CustomerCardForm form={form} isCreate={true} />
    </FormDialog>
  );
}

/**
 * Displays a dialog for editing an existing customer card.
 *
 * Opens a form pre-filled with the provided customer card's data, validates input, and submits updates via an API mutation. Shows success or error notifications and closes the dialog on successful update.
 *
 * @param customerCard - The customer card data to edit
 * @param open - Whether the dialog is open
 * @param onOpenChange - Callback to control the dialog's open state
 */
export function EditCustomerDialog({
  customerCard,
  open,
  onOpenChange,
}: {
  customerCard: CustomerCardWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateCustomerCard();

  const form = useForm({
    defaultValues: {
      cust_surname: customerCard.cust_surname,
      cust_name: customerCard.cust_name,
      cust_patronymic: customerCard.cust_patronymic,
      phone_number: customerCard.phone_number,
      city: customerCard.city,
      street: customerCard.street,
      zip_code: customerCard.zip_code,
      percent: customerCard.percent,
    },
    validators: {
      onChange: baseCustomerCardSchema,
    },
    onSubmit: async ({ value }) => {
      const transformedValue = transformValue(value);

      try {
        await updateMutation.mutateAsync({
          id: customerCard.card_number,
          data: transformedValue,
        });
        toast.success("Customer updated successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to update customer");
      }
    },
  });

  return (
    <FormDialog
      description="Update the customer information."
      isPending={updateMutation.isPending}
      key={`${customerCard.card_number}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Customer"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CustomerCardForm form={form} />
    </FormDialog>
  );
}

/**
 * Displays a confirmation dialog for deleting a customer card.
 *
 * Prompts the user to confirm deletion of the specified customer card and performs the deletion upon confirmation. Shows success or error notifications based on the outcome.
 *
 * @param customerCardNumber - The unique identifier of the customer card to delete.
 * @param open - Whether the dialog is currently open.
 * @param onOpenChange - Callback to control the open state of the dialog.
 */
export function DeleteCustomerDialog({
  customerCardNumber,
  open,
  onOpenChange,
}: {
  customerCardNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = useDeleteCustomerCard();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(customerCardNumber);
      toast.success("Customer deleted successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this customer? This action cannot be undone."
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Customer"
      onConfirm={() => {
        void handleDelete();
      }}
      onOpenChange={onOpenChange}
    />
  );
}
