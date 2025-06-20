import React, { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import { useTableToolbar } from "@/hooks/use-table-toolbar";
import {
  useBulkDeleteCustomerCards,
  useGetCustomerCards,
} from "@/lib/api/customer-cards/hooks";
import { type GetCustomerCardsOptions } from "@/lib/api/customer-cards/types";

import { CreateCustomerDialog } from "./dialogs";
import { type CustomerCardWithId } from "./types";

export function useCustomerCards() {
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
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm,
    }),
    [pagination, searchTerm],
  );

  const { data: paginatedResponse, isLoading } =
    useGetCustomerCards(queryParams);
  const bulkDeleteMutation = useBulkDeleteCustomerCards();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedCustomerCards, setSelectedCustomerCards] = useState<
    CustomerCardWithId[]
  >([]);

  const customerCardsWithId: CustomerCardWithId[] =
    paginatedResponse?.data.map((customerCard) => ({
      ...customerCard,
      id: customerCard.card_number,
    })) ?? [];

  const { toolbar } = useTableToolbar({
    searchPlaceholder: "Search customer cards...",
    inputValue,
    onInputChange: handleInputChange,
    onClearSearch: clearSearch,
    selectedItems: selectedCustomerCards,
    onBulkDelete: async (items) => {
      const customerCardNumbers = items.map((item) => item.card_number);
      await bulkDeleteMutation.mutateAsync({
        card_numbers: customerCardNumbers,
      });
    },
    onBulkDeleteSuccess: () => {
      setSelectedCustomerCards([]);
    },
    bulkDeleteItemName: "customer cards",
    isBulkDeletePending: bulkDeleteMutation.isPending,
    createButton: React.createElement(CreateCustomerDialog),
  });

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedCustomerCards,
    setSelectedCustomerCards,
    customerCardsWithId,

    // Handlers
    handleSortingChange,

    // UI
    toolbar,
  };
}
