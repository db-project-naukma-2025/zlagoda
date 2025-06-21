import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import {
  useBulkDeleteCustomerCards,
  useGetCustomerCards,
} from "@/lib/api/customer-cards/hooks";
import {
  type CustomerCard,
  type GetCustomerCardsOptions,
} from "@/lib/api/customer-cards/types";

interface UseCustomerCardsOptions {
  printMode?: boolean;
}

export function useCustomerCards({
  printMode = false,
}: UseCustomerCardsOptions = {}) {
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

  const queryParams = useMemo<Partial<GetCustomerCardsOptions>>(
    () => ({
      skip: printMode ? 0 : pagination.pageIndex * pagination.pageSize,
      limit: printMode ? null : pagination.pageSize,
      search: searchTerm,
    }),
    [pagination, searchTerm, printMode],
  );

  const {
    data: paginatedResponse,
    isLoading,
    refetch,
  } = useGetCustomerCards(queryParams);
  const bulkDeleteMutation = useBulkDeleteCustomerCards();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedCustomerCards, setSelectedCustomerCards] = useState<
    CustomerCard[]
  >([]);

  const customerCards: CustomerCard[] = paginatedResponse?.data ?? [];

  const handleBulkDelete = async (items: CustomerCard[]) => {
    const customerCardNumbers = items.map((item) => item.card_number);
    await bulkDeleteMutation.mutateAsync({
      ids: customerCardNumbers,
    });
  };

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedCustomerCards,
    setSelectedCustomerCards,
    customerCards,

    data: customerCards, // alias
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
