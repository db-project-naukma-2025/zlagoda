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
import { type Product } from "@/lib/api/products";

import { DeleteProductDialog, EditProductDialog } from "./dialogs";

interface BaseProductTableProps {
  categories: { category_number: number; category_name: string }[];
  categoryFilter?: number;
  setCategoryFilter: (value: number | undefined) => void;
  resetPagination: () => void;
}

export function createBaseProductColumns({
  categories,
  categoryFilter,
  setCategoryFilter,
  resetPagination,
}: BaseProductTableProps): ColumnDef<Product>[] {
  const categoryLookup = categories.reduce<Record<number, string>>(
    (acc, category) => {
      acc[category.category_number] = category.category_name;
      return acc;
    },
    {},
  );

  const categoryFilterConfig = {
    options: [
      ...categories.map((category) => ({
        value: category.category_number.toString(),
        label: category.category_name,
      })),
    ],
    value: categoryFilter?.toString() ?? "",
    onValueChange: (value: string) => {
      setCategoryFilter(value === "" ? undefined : Number(value));
      resetPagination();
    },
    placeholder: "Select category",
    label: "Category",
  };

  return [
    {
      accessorKey: "id_product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("id_product")}</Badge>
      ),
    },
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("product_name")}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "category_number",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          filter={categoryFilterConfig}
          title="Category"
        />
      ),
      cell: ({ row }) => {
        const categoryNumber = row.getValue<number>("category_number");
        const categoryName = categoryLookup[categoryNumber] ?? "Unknown";
        return <Badge variant="secondary">{categoryName}</Badge>;
      },
    },
    {
      accessorKey: "characteristics",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Characteristics" />
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-muted-foreground">
          {row.getValue("characteristics")}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: function Cell({ row }) {
        const product = row.original;
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

            <EditProductDialog
              categories={categories}
              open={isEditOpen}
              product={product}
              onOpenChange={setIsEditOpen}
            />
            <DeleteProductDialog
              open={isDeleteOpen}
              productId={product.id_product}
              onOpenChange={setIsDeleteOpen}
            />
          </>
        );
      },
    },
  ];
}
