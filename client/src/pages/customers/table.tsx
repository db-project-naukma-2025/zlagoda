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
import { type CustomerCard } from "@/lib/api/customer-cards/types";

import { DeleteCustomerDialog, EditCustomerDialog } from "./dialogs";

export function createCustomerCardColumns(
  canDelete: boolean,
  canEdit: boolean,
): ColumnDef<CustomerCard>[] {
  const columns: ColumnDef<CustomerCard>[] = [
    {
      accessorKey: "card_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("card_number")}</Badge>
      ),
    },
    {
      accessorKey: "cust_surname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Surname" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("cust_surname")}</div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: "cust_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("cust_name")}</div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: "cust_patronymic",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patronymic" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("cust_patronymic")}</div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: "phone_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone Number" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("phone_number")}</div>
      ),
      enableHiding: false,
    },

    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("city")}</div>
      ),
      enableHiding: true,
    },

    {
      accessorKey: "street",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Street" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("street")}</div>
      ),
      enableHiding: true,
    },

    {
      accessorKey: "zip_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Zip Code" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("zip_code")}</div>
      ),
      enableHiding: true,
    },

    {
      accessorKey: "percent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Discount" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("percent")}%</div>
      ),
      enableHiding: false,
    },
  ];

  if (canDelete || canEdit) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: function Cell({ row }) {
        const customerCard = row.original;
        const [isEditOpen, setIsEditOpen] = useState(false);
        const [isDeleteOpen, setIsDeleteOpen] = useState(false);

        const menuItems = [];
        const dialogs = [];

        if (canEdit) {
          menuItems.push(
            <DropdownMenuItem
              onSelect={() => {
                setIsEditOpen(true);
              }}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>,
          );

          dialogs.push(
            <EditCustomerDialog
              customerCard={customerCard}
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
            />,
          );
        }

        if (canDelete) {
          if (menuItems.length > 0) {
            menuItems.push(<DropdownMenuSeparator />);
          }

          menuItems.push(
            <DropdownMenuItem
              onSelect={() => {
                setIsDeleteOpen(true);
              }}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>,
          );

          dialogs.push(
            <DeleteCustomerDialog
              customerCardNumber={customerCard.card_number}
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
            />,
          );
        }

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
                <DropdownMenuContent align="end" className="w-32">
                  {menuItems}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {dialogs}
          </>
        );
      },
    });
  }
  return columns;
}
