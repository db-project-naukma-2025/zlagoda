import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";

import { useProducts } from "./use-products";

export default function ProductsPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedProducts,
    productsWithId,
    handleSortingChange,
    toolbar,
    columns,
  } = useProducts();

  return (
    <PageLayout
      description="Manage base product catalog and product definitions."
      isLoading={isLoading}
      loadingText="Loading products..."
      title="Base Products"
    >
      <DataTable
        columns={columns}
        data={productsWithId}
        enableDragAndDrop={false}
        enableRowSelection={true}
        getRowId={(row) => row.id_product.toString()}
        isLoading={isLoading}
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbar}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedProducts}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
