import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { PrintButton } from "@/components/print-button";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";
import { type GetProductsOptions } from "@/lib/api/products/types";

import { CreateProductDialog } from "./dialogs";
import { useProducts } from "./use-products";

export default function ProductsPage() {
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.product.can_create) ?? false;
  const canDelete = user?.scopes.includes(scopes.product.can_delete) ?? false;
  const canEdit = user?.scopes.includes(scopes.product.can_update) ?? false;
  const canPrintToPdf =
    user?.scopes.includes(scopes.product.print_to_pdf) ?? false;

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
    categoryFilter,
  } = useProducts({ canDelete, canEdit });

  const { data: printData } = useProducts({
    canDelete: false,
    canEdit: false,
    printMode: true,
    categoryFilter,
    sortBy: sorting.sort_by as GetProductsOptions["sort_by"],
    sortOrder: sorting.sort_order,
  });

  const createButton = canAdd ? (
    <CreateProductDialog categories={categories?.data ?? []} />
  ) : null;

  const tableToolbar = (
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
  );

  let toolbar;
  if (canPrintToPdf) {
    toolbar = (
      <>
        <div className="flex justify-between items-center">
          <PrintButton columns={columns} data={printData} title="Products" />
          {tableToolbar}
        </div>
      </>
    );
  } else {
    toolbar = tableToolbar;
  }
  return (
    <PageLayout
      description="Manage base product catalog and product definitions."
      title="Base Products"
    >
      {toolbar}
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
