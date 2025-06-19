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

import {
  DeleteCategoryDialog,
  EditCategoryDialog,
  type CategoryWithId,
} from "./dialogs";

export const categoryColumns: ColumnDef<CategoryWithId>[] = [
  {
    accessorKey: "category_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category_number")}</Badge>
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
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: function Cell({ row }) {
      const category = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

          <EditCategoryDialog
            category={category}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <DeleteCategoryDialog
            categoryId={category.category_number}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </>
      );
    },
  },
];
