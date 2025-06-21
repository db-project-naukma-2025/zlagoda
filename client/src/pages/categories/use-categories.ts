import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import {
  useBulkDeleteCategories,
  useGetCategories,
} from "@/lib/api/categories/hooks";
import {
  type Category,
  type GetCategoriesOptions,
} from "@/lib/api/categories/types";

interface UseCategoriesOptions {
  printMode?: boolean;
  sortBy?: GetCategoriesOptions["sort_by"];
  sortOrder?: GetCategoriesOptions["sort_order"] | undefined;
}

export function useCategories({
  printMode = false,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
}: UseCategoriesOptions = {}) {
  const {
    pagination,
    setPagination,
    sorting,
    handleSortingChange,
    resetPagination,
  } = useTableState({
    defaultSorting: {
      sort_by: "category_number",
      sort_order: "desc",
    },
  });

  const { inputValue, searchTerm, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const queryParams = useMemo<Partial<GetCategoriesOptions>>(
    () => ({
      skip: printMode ? 0 : pagination.pageIndex * pagination.pageSize,
      limit: printMode ? null : pagination.pageSize,
      search: searchTerm,
      sort_by: (externalSortBy ??
        sorting.sort_by) as GetCategoriesOptions["sort_by"],
      sort_order: externalSortOrder ?? sorting.sort_order ?? "desc",
    }),
    [
      pagination,
      searchTerm,
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
  } = useGetCategories(queryParams);
  const bulkDeleteMutation = useBulkDeleteCategories();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const categories: Category[] = paginatedResponse?.data ?? [];

  const handleBulkDelete = async (items: Category[]) => {
    const categoryIds = items.map((item) => item.category_number);
    await bulkDeleteMutation.mutateAsync({ ids: categoryIds });
  };

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedCategories,
    setSelectedCategories,
    categories,

    data: categories, // alias
    total: paginatedResponse?.total ?? 0,

    // Handlers
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm: inputValue,
    setSearchTerm: handleInputChange,
    clearSearch,
    refetch,
  };
}
