import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";

interface ReportTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[] | undefined;
  isLoading: boolean;
  keyField: keyof T;
}

export function ReportTable<T>({
  columns,
  data,
  isLoading,
  keyField,
}: ReportTableProps<T>) {
  if (!data) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection={false}
        hidePagination
        isLoading={isLoading}
        keyField={keyField}
        pagination={{
          pageIndex: 0,
          pageSize: data.length,
        }}
        totalPages={1}
        onPaginationChange={() => {
          // disabled
        }}
      />
    </div>
  );
}
