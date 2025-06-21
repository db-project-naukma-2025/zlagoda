import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import {
  useBulkDeleteCustomerCards,
  useSearchCustomerCards,
} from "@/lib/api/customer-cards/hooks";
import {
  type CustomerCard,
  type SearchCustomerCardsOptions,
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
      sort_by: "card_number",
      sort_order: "desc",
    },
  });

  const { inputValue, searchTerm, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const queryParams = useMemo<Partial<SearchCustomerCardsOptions>>(
    () => ({
      skip: printMode ? 0 : pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      cust_surname: searchTerm,
      percent: undefined,
      sort_by: sorting.sort_by as SearchCustomerCardsOptions["sort_by"],
      sort_order:
        sorting.sort_order as SearchCustomerCardsOptions["sort_order"],
    }),
    [pagination, searchTerm, printMode, sorting],
  );

  const {
    data: paginatedResponse,
    isLoading,
    refetch,
  } = useSearchCustomerCards(queryParams);
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
