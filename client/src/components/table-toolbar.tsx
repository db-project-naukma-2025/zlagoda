import React from "react";

import { BulkDeleteButton } from "@/components/common/bulk-delete-button";
import { SearchInput } from "@/components/common/search-input";

interface TableToolbarProps<T> {
  searchValue: string;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  selectedItems: T[];
  enableBulkDelete?: boolean;
  onBulkDelete?: (items: T[]) => Promise<void>;
  isBulkDeletePending?: boolean;
  bulkDeleteItemName?: string;
  createButton?: React.ReactNode;
  additionalFilters?: React.ReactNode[];
}

export function TableToolbar<T>({
  searchValue,
  onSearch,
  onClearSearch,
  selectedItems,
  enableBulkDelete = true,
  onBulkDelete,
  isBulkDeletePending = false,
  bulkDeleteItemName = "items",
  createButton,
  additionalFilters = [],
}: TableToolbarProps<T>) {
  return (
    <div className="flex items-center justify-end gap-2">
      <SearchInput
        placeholder="Search..."
        value={searchValue}
        onChange={onSearch}
        onClear={onClearSearch}
      />
      {additionalFilters.map((filter, idx) => (
        <React.Fragment key={idx}>{filter}</React.Fragment>
      ))}
      {enableBulkDelete && onBulkDelete && selectedItems.length > 0 && (
        <BulkDeleteButton
          isPending={isBulkDeletePending}
          itemName={bulkDeleteItemName}
          selectedItems={selectedItems}
          onDelete={onBulkDelete}
        />
      )}
      {createButton}
    </div>
  );
}
