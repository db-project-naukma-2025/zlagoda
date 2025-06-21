import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Check } from "@/lib/api/checks/types";
import { type Employee } from "@/lib/api/employees/types";

interface CreateChecksColumnsOptions {
  employeeLookup: Record<string, string>;
  employees?: Employee[];
  onCheckClick?: (check: Check) => void;
  canViewEmployees: boolean;
  employeeFilter?: string | undefined;
  setEmployeeFilter?: ((value: string | undefined) => void) | undefined;
  resetPagination?: (() => void) | undefined;
}

export function createChecksColumns({
  employeeLookup,
  employees = [],
  onCheckClick,
  canViewEmployees,
  employeeFilter,
  setEmployeeFilter,
  resetPagination,
}: CreateChecksColumnsOptions): ColumnDef<Check>[] {
  const baseColumns: ColumnDef<Check>[] = [
    {
      accessorKey: "check_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Check Number" />
      ),
      cell: ({ row }) => {
        const checkNumber = row.original.check_number;

        if (onCheckClick) {
          return (
            <Button
              className="h-auto p-0 font-mono text-sm text-left justify-start"
              variant="link"
              onClick={() => {
                onCheckClick(row.original);
              }}
            >
              {checkNumber}
            </Button>
          );
        }

        return <div className="font-mono text-sm">{checkNumber}</div>;
      },
    },
    {
      accessorKey: "print_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date & Time" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.print_date);
        return (
          <div className="text-sm">
            <div>{format(date, "MMM dd, yyyy")}</div>
            <div className="text-muted-foreground">{format(date, "HH:mm")}</div>
          </div>
        );
      },
    },
  ];

  if (canViewEmployees) {
    const employeeFilterConfig =
      setEmployeeFilter && resetPagination
        ? {
            options: [
              ...employees.map((employee) => ({
                value: employee.id_employee,
                label: `${employee.empl_surname} ${employee.empl_name}`,
              })),
            ],
            value: employeeFilter ?? "",
            onValueChange: (value: string) => {
              setEmployeeFilter(value === "" ? undefined : value);
              resetPagination();
            },
            placeholder: "Select employee",
            label: "Employee",
          }
        : undefined;

    baseColumns.push({
      accessorKey: "id_employee",
      header: ({ column }) => {
        if (employeeFilterConfig) {
          return (
            <DataTableColumnHeader
              column={column}
              filter={employeeFilterConfig}
              title="Employee"
            />
          );
        }
        return <DataTableColumnHeader column={column} title="Employee" />;
      },
      cell: ({ row }) => {
        const employeeId = row.original.id_employee;
        const employeeName = employeeLookup[employeeId];
        return (
          <div className="text-sm">
            {employeeName ? (
              <>
                <div>{employeeName}</div>
                <div className="text-muted-foreground font-mono text-xs">
                  {employeeId}
                </div>
              </>
            ) : (
              <Badge className="font-mono text-xs" variant="secondary">
                {employeeId}
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
    });
  }

  baseColumns.push(
    {
      accessorKey: "card_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer Card" />
      ),
      cell: ({ row }) => {
        const cardNumber = row.original.card_number;
        return cardNumber ? (
          <Badge className="font-mono text-xs" variant="secondary">
            {cardNumber}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">No card</span>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "sales",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row }) => {
        const sales = row.original.sales;
        const totalItems = sales.reduce(
          (sum: number, sale) => sum + sale.product_number,
          0,
        );
        return (
          <div className="text-sm">
            <div>{sales.length} types</div>
            <div className="text-muted-foreground">{totalItems} items</div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "sum_total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        const total = row.original.sum_total;
        return <div className="text-sm font-medium">₴{total.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "vat",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="VAT" />
      ),
      cell: ({ row }) => {
        const vat = row.original.vat;
        return (
          <div className="text-sm text-muted-foreground">₴{vat.toFixed(2)}</div>
        );
      },
      enableSorting: false,
    },
  );

  return baseColumns;
}
