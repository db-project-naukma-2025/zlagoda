import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { PrintButton } from "@/components/print-button";
import { TableToolbar } from "@/components/table-toolbar";
import { Combobox } from "@/components/ui/combobox";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";
import { type GetStoreProductsOptions } from "@/lib/api/store-products/types";

import { CreateStoreProductDialog } from "./dialogs";
import { useStoreProducts } from "./use-store-products";

export default function StoreProductsPage() {
  const { user } = useAuth();
  const canAdd =
    user?.scopes.includes(scopes.store_product.can_create) ?? false;
  const canDelete =
    user?.scopes.includes(scopes.store_product.can_delete) ?? false;
  const canEdit =
    user?.scopes.includes(scopes.store_product.can_update) ?? false;

  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedStoreProducts,
    selectedStoreProducts,
    storeProducts,
    promotionalFilter,
    setPromotionalFilter,
    productFilter,
    setProductFilter,
    products,
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    clearSearch,
    columns,
  } = useStoreProducts({ canDelete, canEdit });

  const { data: printData } = useStoreProducts({
    canDelete: false,
    canEdit: false,
    printMode: true,
    promotionalFilter,
    productFilter,
    sortBy: sorting.sort_by as GetStoreProductsOptions["sort_by"],
    sortOrder: sorting.sort_order,
  });

  const productFilterCombobox = (
    <Combobox
      className="w-48"
      emptyMessage="No products found."
      options={[
        { value: "all", label: "All Products" },
        ...products.map((product) => ({
          value: product.id_product.toString(),
          label: product.product_name,
          searchText: product.product_name,
        })),
      ]}
      placeholder="Filter by product"
      searchPlaceholder="Search products..."
      value={productFilter?.toString() ?? "all"}
      onValueChange={(value) => {
        setProductFilter(value === "all" ? undefined : Number(value));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
    />
  );

  const promotionalFilterCombobox = (
    <Combobox
      className="w-40"
      emptyMessage="No types found."
      options={[
        { value: "all", label: "All Types" },
        { value: "false", label: "Regular" },
        { value: "true", label: "Promotional" },
      ]}
      placeholder="Filter by type"
      searchPlaceholder="Search types..."
      value={promotionalFilter?.toString() ?? "all"}
      onValueChange={(value) => {
        setPromotionalFilter(
          value === "all"
            ? undefined
            : value === "true"
              ? true
              : value === "false"
                ? false
                : undefined,
        );
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
    />
  );

  const additionalFilters = [productFilterCombobox, promotionalFilterCombobox];

  const createButton = canAdd ? (
    <CreateStoreProductDialog
      products={products}
      storeProducts={storeProducts}
    />
  ) : null;

  return (
    <PageLayout
      description="Manage store-specific inventory and stock levels."
      isLoading={isLoading}
      loadingText="Loading inventory..."
      title="Store Inventory"
    >
      <div className="flex justify-between items-center">
        <PrintButton
          columns={columns}
          data={printData}
          title="Store Products"
        />
        <TableToolbar
          additionalFilters={additionalFilters}
          bulkDeleteItemName="store products"
          createButton={createButton}
          enableBulkDelete={canDelete}
          isBulkDeletePending={bulkDeleteMutation.isPending}
          searchValue={searchTerm}
          selectedItems={selectedStoreProducts}
          onBulkDelete={handleBulkDelete}
          onClearSearch={clearSearch}
          onSearch={setSearchTerm}
        />
      </div>
      <DataTable
        columns={columns}
        data={storeProducts}
        enableRowSelection={canDelete}
        isLoading={isLoading}
        keyField="UPC"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedStoreProducts}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
