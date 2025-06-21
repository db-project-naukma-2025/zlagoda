import { type ColumnDef } from "@tanstack/react-table";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import { ReportDialog } from "@/components/common/report-dialog";
import { ReportTable } from "@/components/common/report-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetCardSoldCategoriesReport } from "@/lib/api/customer-cards";
import type { CardSoldCategoriesReport } from "@/lib/api/customer-cards/types";

// Revenue Report Columns
const cardSoldCategoriesReportColumns: ColumnDef<CardSoldCategoriesReport>[] = [
  {
    accessorKey: "card_number",
    header: "Card Number",
    cell: ({ row }) => {
      const cardNumber = row.getValue<string>("card_number");
      return <Badge variant="outline">{cardNumber}</Badge>;
    },
  },
  {
    accessorKey: "customer_name",
    header: "Customer Name",
  },
  {
    accessorKey: "category_name",
    header: "Category Name",
  },
  {
    accessorKey: "total_products",
    header: "Total Products Sold",
    cell: ({ row }) => {
      const amount = row.getValue<number>("total_products");
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

export function CardSoldCategoriesReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: reportData, isLoading } = useGetCardSoldCategoriesReport({
    card_number: cardNumber || undefined,
    category_name: categoryName || undefined,
    start_date: dateFrom || undefined,
    end_date: dateTo || undefined,
  });

  return (
    <ReportDialog
      description="Find total products and total revenue from sold items for each customer card by category. Leave fields empty for a global view."
      isOpen={isOpen}
      title="Card Sold Categories Report"
      triggerText="Card Sold Categories Report"
      onOpenChange={setIsOpen}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Card Number</Label>
          <Input
            value={cardNumber}
            onChange={(e) => {
              setCardNumber(e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Category Name</Label>
          <Input
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
            }}
          />
        </div>

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
        columns={cardSoldCategoriesReportColumns}
        data={reportData}
        isLoading={isLoading}
        keyField="card_number"
      />
    </ReportDialog>
  );
}
