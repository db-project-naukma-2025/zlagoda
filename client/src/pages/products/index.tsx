import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { TableToolbar } from "@/components/table-toolbar";

import { CreateProductDialog } from "./dialogs";
import { useProducts } from "./use-products";

export default function ProductsPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedProducts,
    selectedProducts,
    products,
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    clearSearch,
    columns,
    categories,
  } = useProducts();

  const createButton = (
    <CreateProductDialog categories={categories?.data ?? []} />
  );

  return (
    <PageLayout
      description="Manage base product catalog and product definitions."
      title="Base Products"
    >
      <TableToolbar
        bulkDeleteItemName="products"
        createButton={createButton}
        isBulkDeletePending={bulkDeleteMutation.isPending}
        searchValue={searchTerm}
        selectedItems={selectedProducts}
        onBulkDelete={handleBulkDelete}
        onClearSearch={clearSearch}
        onSearch={setSearchTerm}
      />
      <DataTable
        columns={columns}
        data={products}
        enableRowSelection={true}
        isLoading={isLoading}
        keyField="id_product"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedProducts}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
