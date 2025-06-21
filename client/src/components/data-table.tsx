import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconFilter,
} from "@tabler/icons-react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  type PaginationState,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { DataTableCore } from "./data-table-core";
import { DataTablePagination } from "./data-table-pagination";

export interface FilterConfig {
  options: ComboboxOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  filter?: FilterConfig;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  filter,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !filter) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center", className)}>
      {/* Sorting button */}
      {column.getCanSort() && (
        <Button
          className="-ml-3 h-8 data-[state=open]:bg-accent"
          size="sm"
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
        >
          <span>{title}</span>
          {column.getIsSorted() === "desc" ? (
            <IconArrowDown className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <IconArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <IconArrowsSort className="ml-2 h-4 w-4" />
          )}
        </Button>
      )}

      {/* Title when no sorting but has filter */}
      {!column.getCanSort() && filter && (
        <span className="font-medium mr-2">{title}</span>
      )}

      {/* Filter button */}
      {filter && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="h-8 data-[state=open]:bg-accent"
              size="sm"
              variant="ghost"
            >
              <IconFilter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-3">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                {filter.label ?? title}
              </h4>
              <Combobox
                allowClear
                clearText={`All ${filter.label ?? title}`}
                emptyMessage={`No ${filter.label?.toLowerCase() ?? "options"} found.`}
                options={filter.options}
                placeholder={
                  filter.placeholder ??
                  `Select ${filter.label?.toLowerCase() ?? "option"}...`
                }
                searchPlaceholder={`Search ${filter.label?.toLowerCase() ?? "options"}...`}
                value={filter.value ?? ""}
                onValueChange={filter.onValueChange}
              />
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Title only (when no sorting or filtering) */}
      {!column.getCanSort() && !filter && (
        <span className="font-medium">{title}</span>
      )}
    </div>
  );
}

export interface DataTableProps<T, K extends keyof T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyField: K;
  enableRowSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange: (pagination: {
    pageIndex: number;
    pageSize: number;
  }) => void;
  totalPages?: number;
  sorting?: {
    sort_by?: string;
    sort_order?: "asc" | "desc";
  };
  onSortingChange?: (sorting: {
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }) => void;
  isLoading?: boolean;
  hidePagination?: boolean;
}

export function DataTable<T, K extends keyof T>({
  data,
  columns: providedColumns,
  keyField,
  enableRowSelection = true,
  onSelectionChange,
  pagination,
  onPaginationChange,
  totalPages = 0,
  sorting,
  onSortingChange,
  isLoading = false,
  hidePagination = false,
}: DataTableProps<T, K>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const handlePaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue;
      onPaginationChange(newPagination);
    },
    [pagination, onPaginationChange],
  );

  const tableSortingState = useMemo<SortingState>(() => {
    if (!sorting?.sort_by) return [];
    return [{ id: sorting.sort_by, desc: sorting.sort_order === "desc" }];
  }, [sorting]);

  const handleSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      if (!onSortingChange) return;

      const newSortingState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(tableSortingState)
          : updaterOrValue;

      if (newSortingState.length === 0) {
        onSortingChange({ sort_order: "asc" });
      } else {
        const [newSort] = newSortingState;
        if (newSort) {
          onSortingChange({
            sort_by: newSort.id,
            sort_order: newSort.desc ? "desc" : "asc",
          });
        }
      }
    },
    [onSortingChange, tableSortingState],
  );

  const columns = useMemo(() => {
    const cols: ColumnDef<T>[] = [];

    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              aria-label="Select all"
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              onCheckedChange={(value) => {
                row.toggleSelected(!!value);
              }}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      });
    }

    return [...cols, ...providedColumns];
  }, [providedColumns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: tableSortingState,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => String(row[keyField]),
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="flex flex-col gap-4">
      <DataTableCore columns={columns} isLoading={isLoading} table={table} />
      {!hidePagination && (
        <DataTablePagination
          enableRowSelection={enableRowSelection}
          table={table}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
