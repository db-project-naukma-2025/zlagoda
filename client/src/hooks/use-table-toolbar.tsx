import { useMemo, type ReactNode } from "react";

import { BulkDeleteButton } from "@/components/common/bulk-delete-button";
import { SearchInput } from "@/components/common/search-input";

export interface UseTableToolbarOptions<T> {
  searchPlaceholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onClearSearch: () => void;
  selectedItems: T[];
  onBulkDelete?: (items: T[]) => Promise<void>;
  onBulkDeleteSuccess?: () => void;
  bulkDeleteItemName?: string;
  isBulkDeletePending?: boolean;
  additionalFilters?: ReactNode[];
  createButton?: ReactNode;
}

export function useTableToolbar<T>({
  searchPlaceholder,
  inputValue,
  onInputChange,
  onClearSearch,
  selectedItems,
  onBulkDelete,
  onBulkDeleteSuccess,
  bulkDeleteItemName = "items",
  isBulkDeletePending = false,
  additionalFilters = [],
  createButton,
}: UseTableToolbarOptions<T>) {
  const toolbar = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <SearchInput
          placeholder={searchPlaceholder}
          value={inputValue}
          onChange={onInputChange}
          onClear={onClearSearch}
        />

        {additionalFilters.map((filter, index) => (
          <div key={index}>{filter}</div>
        ))}

        {onBulkDelete && selectedItems.length > 0 && (
          <BulkDeleteButton
            isPending={isBulkDeletePending}
            itemName={bulkDeleteItemName}
            selectedItems={selectedItems}
            onDelete={onBulkDelete}
            onSuccess={
              onBulkDeleteSuccess ??
              (() => {
                // Default no-op function
              })
            }
          />
        )}

        {createButton}
      </div>
    ),
    [
      searchPlaceholder,
      inputValue,
      onInputChange,
      onClearSearch,
      additionalFilters,
      selectedItems,
      onBulkDelete,
      onBulkDeleteSuccess,
      bulkDeleteItemName,
      isBulkDeletePending,
      createButton,
    ],
  );

  return { toolbar };
}
