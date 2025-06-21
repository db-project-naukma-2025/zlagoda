import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import { useGetCategories } from "@/lib/api/categories/hooks";
import {
  useBulkDeleteProducts,
  useGetProducts,
} from "@/lib/api/products/hooks";
import {
  type GetProductsOptions,
  type Product,
} from "@/lib/api/products/types";

import { createBaseProductColumns } from "./table";

interface UseProductsOptions {
  canDelete: boolean;
  canEdit: boolean;
  printMode?: boolean;
  categoryFilter?: number | undefined;
  sortBy?: GetProductsOptions["sort_by"];
  sortOrder?: GetProductsOptions["sort_order"] | undefined;
}

export function useProducts({
  canDelete,
  canEdit,
  printMode = false,
  categoryFilter: externalCategoryFilter,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
}: UseProductsOptions) {
  const {
    pagination,
    setPagination,
    sorting,
    handleSortingChange,
    resetPagination,
  } = useTableState({
    defaultSorting: {
      sort_by: "id_product",
      sort_order: "desc",
    },
  });

  const { inputValue, searchTerm, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const [internalCategoryFilter, setCategoryFilter] = useState<
    number | undefined
  >();

  const categoryFilter = externalCategoryFilter ?? internalCategoryFilter;

  const { data: categories } = useGetCategories();

  const queryParams = useMemo<Partial<GetProductsOptions>>(
    () => ({
      skip: printMode ? 0 : pagination.pageIndex * pagination.pageSize,
      limit: printMode ? null : pagination.pageSize,
      search: searchTerm || undefined,
      category_number: categoryFilter,
      sort_by: (externalSortBy ??
        sorting.sort_by) as GetProductsOptions["sort_by"],
      sort_order: externalSortOrder ?? sorting.sort_order ?? "desc",
    }),
    [
      pagination,
      searchTerm,
      categoryFilter,
      sorting,
      printMode,
      externalSortBy,
      externalSortOrder,
    ],
  );

  const {
    data: paginatedResponse,
    isLoading,
    refetch,
  } = useGetProducts(queryParams);
  const bulkDeleteMutation = useBulkDeleteProducts();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const products: Product[] = paginatedResponse?.data ?? [];

  const columns = useMemo(
    () =>
      createBaseProductColumns({
        categories: categories?.data ?? [],
        categoryFilter: categoryFilter ?? 0,
        setCategoryFilter,
        resetPagination,
        canDelete,
        canEdit,
      }),
    [
      categories,
      categoryFilter,
      setCategoryFilter,
      resetPagination,
      canDelete,
      canEdit,
    ],
  );

  const handleBulkDelete = async (items: Product[]) => {
    const productIds = items.map((item) => item.id_product);
    await bulkDeleteMutation.mutateAsync({ ids: productIds });
  };

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedProducts,
    setSelectedProducts,
    products,
    categories,

    data: products, // alias
    total: paginatedResponse?.total ?? 0,

    // Handlers
    handleSortingChange,
    categoryFilter,
    setCategoryFilter,
    resetPagination,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm: inputValue,
    setSearchTerm: handleInputChange,
    clearSearch,
    columns,
    refetch,
  };
}
