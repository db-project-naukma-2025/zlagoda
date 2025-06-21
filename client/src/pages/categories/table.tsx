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
import { type Category } from "@/lib/api/categories/types";

import { DeleteCategoryDialog, EditCategoryDialog } from "./dialogs";

export function createCategoryColumns(
  canDelete: boolean,
  canEdit: boolean,
): ColumnDef<Category>[] {
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          className="flex justify-center items-center"
          column={column}
          title="ID"
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center w-full">
          <Badge variant="outline">{row.getValue("category_number")}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "category_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("category_name")}</div>
      ),
      enableHiding: false,
    },
  ];

  if (canDelete || canEdit) {
    columns.push({
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: function Cell({ row }) {
        const category = row.original;
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
            <EditCategoryDialog
              category={category}
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
            <DeleteCategoryDialog
              categoryId={category.category_number}
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
