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

import { EmployeeFormFields } from "./form";

export function CreateEmployeeDialog() {
  const createMutation = useCreateEmployee();

  const { form, open, setOpen, isPending } = useCreateDialog({
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
    schema: createEmployeeSchema,
    createMutation,
    successMessage: "Employee created successfully",
    errorMessage: "Failed to create employee",
  });

  return (
    <FormDialog
      description="Add a new employee to the system."
      isPending={isPending}
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

  const { form, isPending } = useEditDialog({
    item: employee,
    schema: updateEmployeeSchema,
    updateMutation,
    getDefaultValues: (emp) => ({
      empl_surname: emp.empl_surname,
      empl_name: emp.empl_name,
      empl_patronymic: emp.empl_patronymic,
      empl_role: emp.empl_role,
      salary: emp.salary,
      date_of_birth: emp.date_of_birth,
      date_of_start: emp.date_of_start,
      phone_number: emp.phone_number,
      city: emp.city,
      street: emp.street,
      zip_code: emp.zip_code,
    }),
    getId: (emp) => emp.id_employee,
    successMessage: "Employee updated successfully",
    errorMessage: "Failed to update employee",
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  return (
    <FormDialog
      description="Update the employee information."
      isPending={isPending}
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

  const { handleDelete, isPending } = useDeleteDialog({
    deleteMutation,
    successMessage: "Employee deleted successfully",
    errorMessage: "Failed to delete employee",
  });

  return (
    <ConfirmationDialog
      cancelText="Cancel"
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description={`Are you sure you want to delete employee "${employeeName}" (ID: ${employeeId})? This action cannot be undone.`}
      isPending={isPending}
      open={open}
      title="Delete Employee"
      onConfirm={() => {
        void handleDelete(employeeId, onOpenChange);
      }}
      onOpenChange={onOpenChange}
    />
  );
}
