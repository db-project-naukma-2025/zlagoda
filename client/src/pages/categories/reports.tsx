import { type ColumnDef } from "@tanstack/react-table";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { ReportDialog } from "@/components/common/report-dialog";
import { ReportTable } from "@/components/common/report-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetCategoriesWithAllProductsSold,
  useGetCategoryRevenueReport,
} from "@/lib/api/categories/hooks";
import type {
  CategoryRevenueReport,
  CategoryWithAllProductsSold,
} from "@/lib/api/categories/types";

// Revenue Report Columns
const revenueReportColumns: ColumnDef<CategoryRevenueReport>[] = [
  {
    accessorKey: "category_number",
    header: "Category #",
  },
  {
    accessorKey: "category_name",
    header: "Category Name",
  },
  {
    accessorKey: "total_amount",
    header: "Total Items Sold",
    cell: ({ row }) => {
      const amount = row.getValue<number>("total_amount");
      return <span className="font-medium">{amount.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "total_revenue",
    header: "Total Revenue",
    cell: ({ row }) => {
      const revenue = row.getValue<number>("total_revenue");
      return (
        <span className="font-medium">
          ₴{revenue.toFixed(2).toLocaleString()}
        </span>
      );
    },
  },
];

const allProductsSoldColumns: ColumnDef<CategoryWithAllProductsSold>[] = [
  {
    accessorKey: "category_number",
    header: "Category #",
  },
  {
    accessorKey: "category_name",
    header: "Category Name",
  },
  {
    id: "status",
    header: "Status",
    cell: () => (
      <Badge className="bg-green-100 text-green-800" variant="secondary">
        All Products Sold
      </Badge>
    ),
  },
];

export function CategoryRevenueReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: reportData, isLoading } = useGetCategoryRevenueReport(
    dateFrom,
    dateTo,
    isOpen,
  );

  return (
    <ReportDialog
      description="View total revenue and items sold for categories within a date range. Leave dates empty to view all time."
      isOpen={isOpen}
      title="Category Revenue Report"
      triggerText="Revenue Report"
      onOpenChange={setIsOpen}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={
                  !dateFrom
                    ? "text-muted-foreground w-full justify-start"
                    : "w-full justify-start"
                }
                variant="outline"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? (
                  format(parse(dateFrom, "yyyy-MM-dd", new Date()), "PPP")
                ) : (
                  <span>Pick start date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                captionLayout="dropdown"
                mode="single"
                selected={
                  dateFrom
                    ? parse(dateFrom, "yyyy-MM-dd", new Date())
                    : undefined
                }
                onSelect={(selected) => {
                  setDateFrom(selected ? format(selected, "yyyy-MM-dd") : "");
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={
                  !dateTo
                    ? "text-muted-foreground w-full justify-start"
                    : "w-full justify-start"
                }
                variant="outline"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? (
                  format(parse(dateTo, "yyyy-MM-dd", new Date()), "PPP")
                ) : (
                  <span>Pick end date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                captionLayout="dropdown"
                mode="single"
                selected={
                  dateTo ? parse(dateTo, "yyyy-MM-dd", new Date()) : undefined
                }
                onSelect={(selected) => {
                  setDateTo(selected ? format(selected, "yyyy-MM-dd") : "");
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ReportTable
        columns={revenueReportColumns}
        data={reportData}
        isLoading={isLoading}
        keyField="category_number"
      />
    </ReportDialog>
  );
}

export function AllProductsSoldReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: reportData, isLoading } =
    useGetCategoriesWithAllProductsSold(isOpen);

  return (
    <ReportDialog
      description="View categories where all products have been sold at least once."
      isOpen={isOpen}
      title="Categories with All Products Sold"
      triggerText="All Products Sold Report"
      onOpenChange={setIsOpen}
    >
      <ReportTable
        columns={allProductsSoldColumns}
        data={reportData}
        isLoading={isLoading}
        keyField="category_number"
      />
    </ReportDialog>
  );
}
