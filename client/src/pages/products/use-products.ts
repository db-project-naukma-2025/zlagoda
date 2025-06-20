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

export function useProducts() {
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

  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();

  // TODO: load lazily, do not limit by 1000
  const { data: categories } = useGetCategories({ limit: 1000 });

  const queryParams = useMemo<Partial<GetProductsOptions>>(
    () => ({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm || undefined,
      category_number: categoryFilter,
      sort_by: sorting.sort_by as GetProductsOptions["sort_by"],
      sort_order: sorting.sort_order ?? "desc",
    }),
    [pagination, searchTerm, categoryFilter, sorting],
  );

  const { data: paginatedResponse, isLoading } = useGetProducts(queryParams);
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
      }),
    [categories, categoryFilter, setCategoryFilter, resetPagination],
  );

  // Bulk delete handler for DataTable
  const handleBulkDelete = async (items: Product[]) => {
    const productIds = items.map((item) => item.id_product);
    await bulkDeleteMutation.mutateAsync({ product_ids: productIds });
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
  };
}
