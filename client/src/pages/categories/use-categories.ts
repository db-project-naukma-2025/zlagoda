import React, { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import { useTableToolbar } from "@/hooks/use-table-toolbar";
import {
  useBulkDeleteCategories,
  useGetCategories,
} from "@/lib/api/categories/hooks";
import { type GetCategoriesOptions } from "@/lib/api/categories/types";

import { CreateCategoryDialog, type CategoryWithId } from "./dialogs";

export function useCategories() {
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
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm,
      sort_by: sorting.sort_by as GetCategoriesOptions["sort_by"],
      sort_order: sorting.sort_order ?? "desc",
    }),
    [pagination, searchTerm, sorting],
  );

  const { data: paginatedResponse, isLoading } = useGetCategories(queryParams);
  const bulkDeleteMutation = useBulkDeleteCategories();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedCategories, setSelectedCategories] = useState<
    CategoryWithId[]
  >([]);

  const categoriesWithId: CategoryWithId[] =
    paginatedResponse?.data.map((category) => ({
      ...category,
      id: category.category_number,
    })) ?? [];

  const { toolbar } = useTableToolbar({
    searchPlaceholder: "Search categories...",
    inputValue,
    onInputChange: handleInputChange,
    onClearSearch: clearSearch,
    selectedItems: selectedCategories,
    onBulkDelete: async (items) => {
      const categoryIds = items.map((item) => item.category_number);
      await bulkDeleteMutation.mutateAsync({
        category_numbers: categoryIds,
      });
    },
    onBulkDeleteSuccess: () => {
      setSelectedCategories([]);
    },
    bulkDeleteItemName: "categories",
    isBulkDeletePending: bulkDeleteMutation.isPending,
    createButton: React.createElement(CreateCategoryDialog),
  });

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedCategories,
    setSelectedCategories,
    categoriesWithId,

    // Handlers
    handleSortingChange,

    // UI
    toolbar,
  };
}
