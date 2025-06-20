import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import { useGetCategories } from "@/lib/api/categories/hooks";
import { useGetProducts } from "@/lib/api/products/hooks";
import {
  useBulkDeleteStoreProducts,
  useGetStoreProducts,
} from "@/lib/api/store-products/hooks";
import {
  type GetStoreProductsOptions,
  type StoreProduct,
} from "@/lib/api/store-products/types";

import { createStoreInventoryColumns } from "./table";

export function useStoreProducts() {
  const {
    pagination,
    setPagination,
    sorting,
    handleSortingChange,
    resetPagination,
  } = useTableState({
    defaultSorting: {
      sort_by: "UPC",
      sort_order: "asc",
    },
  });

  const { inputValue, searchTerm, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const [promotionalFilter, setPromotionalFilter] = useState<
    boolean | undefined
  >();
  const [productFilter, setProductFilter] = useState<number | undefined>();

  // TODO: load lazily, do not limit by 1000
  const { data: categoriesResponse } = useGetCategories({ limit: 1000 });
  const { data: productsResponse } = useGetProducts({ limit: 1000 });
  const { data: allStoreProductsResponse } = useGetStoreProducts({
    limit: 1000,
  });

  const categories = useMemo(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse?.data],
  );
  const productList = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse?.data],
  );
  const allStoreProducts = useMemo(
    () => allStoreProductsResponse?.data ?? [],
    [allStoreProductsResponse?.data],
  );

  const queryParams = useMemo<Partial<GetStoreProductsOptions>>(
    () => ({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm,
      promotional_only: promotionalFilter,
      id_product: productFilter,
      sort_by: sorting.sort_by as GetStoreProductsOptions["sort_by"],
      sort_order: sorting.sort_order ?? "asc",
    }),
    [pagination, searchTerm, promotionalFilter, productFilter, sorting],
  );

  const { data: paginatedResponse, isLoading } =
    useGetStoreProducts(queryParams);
  const bulkDeleteMutation = useBulkDeleteStoreProducts();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedStoreProducts, setSelectedStoreProducts] = useState<
    StoreProduct[]
  >([]);

  const storeProductsData: StoreProduct[] = paginatedResponse?.data ?? [];

  const categoryLookup = useMemo(() => {
    return categories.reduce<Record<number, string>>((acc, category) => {
      acc[category.category_number] = category.category_name;
      return acc;
    }, {});
  }, [categories]);

  const productLookup = useMemo(() => {
    return productList.reduce<
      Record<number, { name: string; category: string }>
    >((acc, product) => {
      acc[product.id_product] = {
        name: product.product_name,
        category: categoryLookup[product.category_number] ?? "Unknown",
      };
      return acc;
    }, {});
  }, [productList, categoryLookup]);

  const columns = useMemo(
    () =>
      createStoreInventoryColumns({
        productLookup,
        products: productList,
        allStoreProducts,
      }),
    [productLookup, productList, allStoreProducts],
  );

  // Bulk delete handler for DataTable
  const handleBulkDelete = async (items: StoreProduct[]) => {
    const upcs = items.map((item) => item.UPC);
    await bulkDeleteMutation.mutateAsync({ upcs });
  };

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedStoreProducts,
    setSelectedStoreProducts,
    storeProducts: storeProductsData,
    allStoreProducts,
    categories,
    products: productList,

    // Filters
    promotionalFilter,
    setPromotionalFilter,
    productFilter,
    setProductFilter,

    // Handlers
    handleSortingChange,
    resetPagination,
    handleBulkDelete,
    bulkDeleteMutation,
    searchPlaceholder: "Search store products...",
    searchTerm: inputValue,
    setSearchTerm: handleInputChange,
    clearSearch,
    columns,
  };
}
