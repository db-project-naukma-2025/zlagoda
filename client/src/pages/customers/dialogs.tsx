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
  baseCustomerCardSchema,
  createCustomerCardSchema,
  useCreateCustomerCard,
  useDeleteCustomerCard,
  useUpdateCustomerCard,
  type CustomerCard,
} from "@/lib/api/customer-cards";

import { CustomerCardForm } from "./form";

export function CreateCustomerDialog() {
  const createMutation = useCreateCustomerCard();

  const { form, open, setOpen, isPending } = useCreateDialog({
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
    schema: createCustomerCardSchema,
    createMutation,
    successMessage: "Customer created successfully",
    errorMessage: "Failed to create customer",
  });

  return (
    <FormDialog
      description="Add a new customer to the system."
      isPending={isPending}
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

export function EditCustomerDialog({
  customerCard,
  open,
  onOpenChange,
}: {
  customerCard: CustomerCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateCustomerCard();

  const { form, isPending } = useEditDialog({
    item: customerCard,
    schema: baseCustomerCardSchema,
    updateMutation,
    getDefaultValues: (customer) => ({
      cust_surname: customer.cust_surname,
      cust_name: customer.cust_name,
      cust_patronymic: customer.cust_patronymic,
      phone_number: customer.phone_number,
      city: customer.city,
      street: customer.street,
      zip_code: customer.zip_code,
      percent: customer.percent,
    }),
    getId: (customer) => customer.card_number,
    successMessage: "Customer updated successfully",
    errorMessage: "Failed to update customer",
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <FormDialog
      description="Update the customer information."
      isPending={isPending}
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

  const { handleDelete, isPending } = useDeleteDialog({
    deleteMutation,
    successMessage: "Customer deleted successfully",
    errorMessage: "Failed to delete customer",
  });

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this customer? This action cannot be undone."
      isPending={isPending}
      open={open}
      title="Delete Customer"
      onConfirm={() => {
        void handleDelete(customerCardNumber, onOpenChange);
      }}
      onOpenChange={onOpenChange}
    />
  );
}
