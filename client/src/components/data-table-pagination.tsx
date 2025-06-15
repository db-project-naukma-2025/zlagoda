import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { type Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalPages: number;
}

export function DataTablePagination<TData>({
  table,
  totalPages,
}: DataTablePaginationProps<TData>) {
  const pagination = table.getState().pagination;

  return (
    <div className="flex items-center justify-between px-4">
      <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of many row(s)
        selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label className="text-sm font-medium" htmlFor="rows-per-page">
            Rows per page
          </Label>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-20" id="rows-per-page" size="sm">
              <SelectValue placeholder={pagination.pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {pagination.pageIndex + 1}{" "}
          {totalPages > 0 && `of ${totalPages.toString()}`}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={!table.getCanPreviousPage()}
            variant="outline"
            onClick={() => {
              table.setPageIndex(0);
            }}
          >
            <span className="sr-only">Go to first page</span>
            <IconChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            size="icon"
            variant="outline"
            onClick={() => {
              table.previousPage();
            }}
          >
            <span className="sr-only">Go to previous page</span>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            className="size-8"
            disabled={!table.getCanNextPage()}
            size="icon"
            variant="outline"
            onClick={() => {
              table.nextPage();
            }}
          >
            <span className="sr-only">Go to next page</span>
            <IconChevronRight className="h-4 w-4" />
          </Button>
          <Button
            className="hidden size-8 lg:flex"
            disabled={!table.getCanNextPage()}
            size="icon"
            variant="outline"
            onClick={() => {
              table.setPageIndex(Number(totalPages) - 1);
            }}
          >
            <span className="sr-only">Go to last page</span>
            <IconChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
