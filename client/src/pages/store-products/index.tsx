import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { Combobox } from "@/components/ui/combobox";

import { useStoreProducts } from "./use-store-products";

export default function StoreProductsPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedStoreProducts,
    storeProductsWithId,
    handleSortingChange,
    toolbar,
    columns,
    promotionalFilter,
    setPromotionalFilter,
    productFilter,
    setProductFilter,
    products,
  } = useStoreProducts();

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

  const toolbarWithFilters = {
    ...toolbar,
    additionalFilters: [productFilterCombobox, promotionalFilterCombobox],
  };

  return (
    <PageLayout
      description="Manage store-specific inventory and stock levels."
      isLoading={isLoading}
      loadingText="Loading inventory..."
      title="Store Inventory"
    >
      <DataTable
        columns={columns}
        data={storeProductsWithId}
        enableDragAndDrop={false}
        enableRowSelection={true}
        getRowId={(row) => row.UPC}
        isLoading={isLoading}
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbarWithFilters}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedStoreProducts}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
