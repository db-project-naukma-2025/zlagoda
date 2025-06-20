import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Employee } from "@/lib/api/employees/types";

import { DeleteEmployeeDialog, EditEmployeeDialog } from "./dialogs";

export function createEmployeeColumns(): ColumnDef<Employee>[] {
  return [
    {
      accessorKey: "id_employee",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Employee ID" />
      ),
      cell: ({ row }) => (
        <Badge className="font-mono" variant="outline">
          {row.getValue("id_employee")}
        </Badge>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "empl_surname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const surname = row.getValue<string>("empl_surname");
        const name = row.original.empl_name;
        const patronymic = row.original.empl_patronymic;

        const fullName = [surname, name, patronymic].filter(Boolean).join(" ");

        return (
          <div className="space-y-1">
            <div className="font-medium">{fullName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "empl_role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.getValue<string>("empl_role");
        return (
          <Badge variant={role === "manager" ? "default" : "secondary"}>
            {role === "manager" ? "Manager" : "Cashier"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Salary" />
      ),
      cell: ({ row }) => {
        const salary = Number(row.getValue("salary"));
        return <div className="font-mono">₴{salary.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "phone_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("phone_number")}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }) => {
        const city = row.getValue<string>("city");
        const street = row.original.street;
        const zipCode = row.original.zip_code;

        return (
          <div className="space-y-1">
            <div className="text-sm">{city}</div>
            <div className="text-xs text-muted-foreground">
              {street}, {zipCode}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "date_of_birth",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date of Birth" />
      ),
      cell: ({ row }) => {
        const dob = new Date(row.getValue("date_of_birth"));
        return <div className="text-sm">{dob.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "date_of_start",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        const startDate = new Date(row.getValue("date_of_start"));
        return <div className="text-sm">{startDate.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: function Cell({ row }) {
        const employee = row.original;
        const [isEditOpen, setIsEditOpen] = useState(false);
        const [isDeleteOpen, setIsDeleteOpen] = useState(false);

        const employeeName = [
          employee.empl_surname,
          employee.empl_name,
          employee.empl_patronymic,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="data-[state=open]:bg-muted"
                    size="icon"
                    variant="ghost"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsEditOpen(true);
                    }}
                  >
                    <IconEdit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      setIsDeleteOpen(true);
                    }}
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <EditEmployeeDialog
              employee={employee}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            />
            <DeleteEmployeeDialog
              employeeId={employee.id_employee}
              employeeName={employeeName}
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
            />
          </>
        );
      },
    },
  ];
}
