import { IconArchive, IconBox } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Products</h2>
        <p className="text-muted-foreground">
          Manage your product catalog and inventory.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link className="block" to="/products/base-products">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconBox className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Base Products</CardTitle>
                  <CardDescription>
                    Manage base product catalog and definitions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create, edit, and organize your core product catalog. Define
                product specifications, categories, and basic information that
                applies across all stores.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link className="block" to="/products/store-inventory">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconArchive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Store Inventory</CardTitle>
                  <CardDescription>
                    Manage store-specific inventory and stock levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track inventory levels, manage stock for specific store
                locations, and monitor product availability across your retail
                network.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
