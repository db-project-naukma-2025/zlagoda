import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";

import { CreateProductDialog } from "./dialogs";
import { useProducts } from "./use-products";

export default function ProductsPage() {
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.product.can_create) ?? false;
  const canDelete = user?.scopes.includes(scopes.product.can_delete) ?? false;
  const canEdit = user?.scopes.includes(scopes.product.can_update) ?? false;

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
  } = useProducts(canDelete, canEdit);

  const createButton = canAdd ? (
    <CreateProductDialog categories={categories?.data ?? []} />
  ) : null;

  return (
    <PageLayout
      description="Manage base product catalog and product definitions."
      title="Base Products"
    >
      <TableToolbar
        bulkDeleteItemName="products"
        createButton={createButton}
        enableBulkDelete={canDelete}
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
        enableRowSelection={canDelete}
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
