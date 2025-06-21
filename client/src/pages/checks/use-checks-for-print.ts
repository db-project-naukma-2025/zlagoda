import { createPrintHook } from "@/hooks/create-print-hook";
import { useGetChecks } from "@/lib/api/checks/hooks";
import { type GetChecksOptions } from "@/lib/api/checks/types";

interface UseChecksForPrintOptions {
  employeeFilter?: string | undefined;
  productFilter?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  sortBy?: GetChecksOptions["sort_by"];
  sortOrder?: GetChecksOptions["sort_order"];
  enabled?: boolean;
}

const mapOptionsToParams = (
  options: UseChecksForPrintOptions,
): Partial<GetChecksOptions> => ({
  employee_id: options.employeeFilter,
  product_upc: options.productFilter,
  date_from: options.dateFrom,
  date_to: options.dateTo,
});

export const useChecksForPrint = createPrintHook(
  useGetChecks,
  mapOptionsToParams,
  "print_date",
  "desc",
);
