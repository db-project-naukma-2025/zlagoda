import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { FormDialog } from "@/components/common/form-dialog";
import { Button } from "@/components/ui/button";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "@/lib/api/employees/hooks";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type Employee,
  type EmployeeId,
} from "@/lib/api/employees/types";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";

import { EmployeeFormFields } from "./form";

export function CreateEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateEmployee();

  const form = useForm({
    defaultValues: {
      id_employee: "",
      empl_surname: "",
      empl_name: "",
      empl_patronymic: null as string | null,
      empl_role: "cashier" as "cashier" | "manager",
      salary: 0,
      date_of_birth: "",
      date_of_start: "",
      phone_number: "",
      city: "",
      street: "",
      zip_code: "",
    },
    validators: {
      onChange: createEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        toast.success("Employee created successfully");
        form.reset();
        setOpen(false);
      } catch (error) {
        console.error("Failed to create employee:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to create employee",
        );
        toast.error(errorMessage);
      }
    },
  });

  return (
    <FormDialog
      description="Add a new employee to the system."
      isPending={createMutation.isPending}
      open={open}
      submitText="Create"
      title="Create Employee"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <EmployeeFormFields form={form} isCreate={true} />
    </FormDialog>
  );
}

interface EditEmployeeDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: EditEmployeeDialogProps) {
  const updateMutation = useUpdateEmployee();

  const form = useForm({
    defaultValues: {
      empl_surname: employee.empl_surname,
      empl_name: employee.empl_name,
      empl_patronymic: employee.empl_patronymic,
      empl_role: employee.empl_role,
      salary: employee.salary,
      date_of_birth: employee.date_of_birth,
      date_of_start: employee.date_of_start,
      phone_number: employee.phone_number,
      city: employee.city,
      street: employee.street,
      zip_code: employee.zip_code,
    },
    validators: {
      onChange: updateEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: employee.id_employee,
          data: value,
        });
        toast.success("Employee updated successfully");
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update employee:", error);
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to update employee",
        );
        toast.error(errorMessage);
      }
    },
  });

  return (
    <FormDialog
      description="Update the employee information."
      isPending={updateMutation.isPending}
      key={`${employee.id_employee}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Employee"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <EmployeeFormFields form={form} />
    </FormDialog>
  );
}

interface DeleteEmployeeDialogProps {
  employeeId: EmployeeId;
  employeeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmployeeDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) {
  const deleteMutation = useDeleteEmployee();

  return (
    <ConfirmationDialog
      cancelText="Cancel"
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description={`Are you sure you want to delete employee "${employeeName}" (ID: ${employeeId})? This action cannot be undone.`}
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Employee"
      onConfirm={() => {
        void (async () => {
          try {
            await deleteMutation.mutateAsync(employeeId);
            toast.success("Employee deleted successfully");
            onOpenChange(false);
          } catch (error) {
            console.error("Failed to delete employee:", error);
            const errorMessage = getApiErrorMessage(
              error,
              "Failed to delete employee",
            );
            toast.error(errorMessage);
          }
        })();
      }}
      onOpenChange={onOpenChange}
    />
  );
}
