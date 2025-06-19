import { useCallback, useState } from "react";

export interface TableSorting {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface TablePagination {
  pageIndex: number;
  pageSize: number;
}

export interface UseTableStateOptions {
  defaultSorting: TableSorting;
  defaultPageSize?: number;
}

export function useTableState({
  defaultSorting,
  defaultPageSize = 10,
}: UseTableStateOptions) {
  const [pagination, setPagination] = useState<TablePagination>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [sorting, setSorting] = useState<TableSorting>(defaultSorting);

  const handleSortingChange = useCallback(
    (newSorting: { sort_by?: string; sort_order?: "asc" | "desc" }) => {
      setSorting((prev) => ({
        sort_by: newSorting.sort_by ?? prev.sort_by ?? "",
        sort_order: newSorting.sort_order ?? prev.sort_order ?? "asc",
      }));
    },
    [],
  );

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    handleSortingChange,
    resetPagination,
  };
}
