import { createPrintHook } from "@/hooks/create-print-hook";
import { useGetEmployees } from "@/lib/api/employees/hooks";
import { type GetEmployeesOptions } from "@/lib/api/employees/types";

interface UseEmployeesForPrintOptions {
  search?: string | undefined;
  roleFilter?: string | undefined;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

// Map options to API parameters
const mapOptionsToParams = (
  options: UseEmployeesForPrintOptions,
): Partial<GetEmployeesOptions> => ({
  search: options.search,
  role_filter: options.roleFilter,
});

// Create the print hook using the factory
export const useEmployeesForPrint = createPrintHook(
  useGetEmployees,
  mapOptionsToParams,
  "empl_surname", // default sortBy
  "asc", // default sortOrder
);

// Re-export the options type for convenience
export type { UseEmployeesForPrintOptions };
