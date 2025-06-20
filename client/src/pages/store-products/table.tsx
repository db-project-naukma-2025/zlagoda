import {
  IconDotsVertical,
  IconEdit,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
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
import { type StoreProduct } from "@/lib/api/store-products/types";

import {
  CreatePromotionalDialog,
  DeleteStoreProductDialog,
  EditStoreProductDialog,
} from "./dialogs";

interface SimpleProduct {
  id_product: number;
  product_name: string;
  category_number: number;
}

interface CreateStoreInventoryColumnsProps {
  productLookup: Record<number, { name: string; category: string }>;
  products: SimpleProduct[];
  allStoreProducts: StoreProduct[];
}

export function createStoreInventoryColumns({
  productLookup,
  products,
  allStoreProducts,
}: CreateStoreInventoryColumnsProps): ColumnDef<StoreProduct>[] {
  return [
    {
      accessorKey: "UPC",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UPC" />
      ),
      cell: ({ row }) => (
        <Badge className="font-mono" variant="outline">
          {row.getValue("UPC")}
        </Badge>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "id_product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => {
        const productId = row.getValue<number>("id_product");
        const product = productLookup[productId];
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {product?.name ?? "Unknown Product"}
            </div>
            <Badge className="text-xs" variant="secondary">
              {product?.category ?? "Unknown Category"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "selling_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = Number(row.getValue("selling_price"));
        const isPromotional = row.getValue("promotional_product");
        return (
          <div className="space-y-1">
            <div className="font-mono">₴{price.toFixed(2)}</div>
            {!!isPromotional && (
              <div className="text-xs text-green-600">
                Promotional price (80% discount)
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "products_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const stock = row.getValue<number>("products_number");
        return (
          <Badge
            variant={
              stock === 0 ? "destructive" : stock < 10 ? "secondary" : "default"
            }
          >
            {stock} units
          </Badge>
        );
      },
    },
    {
      accessorKey: "promotional_product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promotional" />
      ),
      cell: ({ row }) => {
        const isPromotional = row.getValue("promotional_product");
        return isPromotional ? (
          <Badge variant="default">Promotional</Badge>
        ) : (
          <Badge variant="outline">Regular</Badge>
        );
      },
    },
    {
      accessorKey: "UPC_prom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Promotional Product" />
      ),
      cell: ({ row }) => {
        const promoUPC = row.getValue<string | null>("UPC_prom");
        if (!promoUPC) {
          return <span className="text-muted-foreground text-sm">—</span>;
        }

        const promoStoreProduct = allStoreProducts.find(
          (sp) => sp.UPC === promoUPC,
        );
        const promoProduct = promoStoreProduct
          ? products.find((p) => p.id_product === promoStoreProduct.id_product)
          : null;

        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {promoProduct?.product_name ?? "Unknown Product"}
            </div>
            <Badge className="font-mono text-xs" variant="outline">
              {promoUPC}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: function Cell({ row }) {
        const storeProduct = row.original;
        const [isEditOpen, setIsEditOpen] = useState(false);
        const [isDeleteOpen, setIsDeleteOpen] = useState(false);
        const [isPromotionalOpen, setIsPromotionalOpen] = useState(false);

        const canCreatePromotional =
          !storeProduct.promotional_product &&
          storeProduct.products_number > 0 &&
          !allStoreProducts.some(
            (sp) =>
              sp.id_product === storeProduct.id_product &&
              sp.promotional_product,
          );

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
                  {canCreatePromotional && (
                    <DropdownMenuItem
                      onSelect={() => {
                        setIsPromotionalOpen(true);
                      }}
                    >
                      <IconStar className="mr-2 h-4 w-4" />
                      Create Promotional
                    </DropdownMenuItem>
                  )}
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

            <EditStoreProductDialog
              open={isEditOpen}
              products={products}
              storeProduct={storeProduct}
              storeProducts={allStoreProducts}
              onOpenChange={setIsEditOpen}
            />
            {canCreatePromotional && (
              <CreatePromotionalDialog
                open={isPromotionalOpen}
                products={products}
                sourceStoreProduct={storeProduct}
                onOpenChange={setIsPromotionalOpen}
              />
            )}
            <DeleteStoreProductDialog
              open={isDeleteOpen}
              upc={storeProduct.UPC}
              onOpenChange={setIsDeleteOpen}
            />
          </>
        );
      },
    },
  ];
}
