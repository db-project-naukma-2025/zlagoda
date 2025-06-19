import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconFilter,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

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

function DragHandle({ id }: { id: string | number }) {
  const { attributes, listeners } = useSortable({
    id: id.toString(),
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      className="text-muted-foreground size-7 hover:bg-transparent"
      size="icon"
      variant="ghost"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow<T extends { id: string | number }>({
  row,
}: {
  row: Row<T>;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id.toString(),
  });

  return (
    <TableRow
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  enableDragAndDrop?: boolean;
  enableRowSelection?: boolean;
  onDataChange?: (data: T[]) => void;
  getRowId?: (row: T) => string;
  toolbar?: React.ReactNode;
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
}

export function DataTable<T extends { id: string | number }>({
  data: initialData,
  columns: providedColumns,
  enableDragAndDrop = false,
  enableRowSelection = true,
  onDataChange,
  getRowId,
  toolbar,
  onSelectionChange,
  pagination,
  onPaginationChange,
  totalPages = 0,
  sorting,
  onSortingChange,
  isLoading = false,
}: DataTableProps<T>) {
  const [data, setData] = useState(() => initialData);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

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

    if (enableDragAndDrop) {
      cols.push({
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
        size: 40,
      });
    }

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
  }, [providedColumns, enableDragAndDrop, enableRowSelection]);

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.map((item) => item.id.toString()),
    [data],
  );

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
    getRowId: getRowId ? (row) => getRowId(row) : (row) => row.id.toString(),
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newData = (data: T[]) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      };
      setData(newData);
      if (onDataChange) {
        onDataChange(newData(data));
      }
    }
  }

  const tableContent = (
    <Table>
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead colSpan={header.colSpan} key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell
              className="h-24 text-center text-muted-foreground"
              colSpan={columns.length}
            >
              Loading...
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows.length ? (
          enableDragAndDrop ? (
            <SortableContext
              items={dataIds}
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows.map((row) => (
                <DraggableRow key={row.id} row={row} />
              ))}
            </SortableContext>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )
        ) : (
          <TableRow>
            <TableCell className="h-24 text-center" colSpan={columns.length}>
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} toolbar={toolbar} />

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        {enableDragAndDrop ? (
          <DndContext
            collisionDetection={closestCenter}
            id={sortableId}
            modifiers={[restrictToVerticalAxis]}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            {tableContent}
          </DndContext>
        ) : (
          tableContent
        )}
      </div>

      <DataTablePagination table={table} totalPages={totalPages} />
    </div>
  );
}
