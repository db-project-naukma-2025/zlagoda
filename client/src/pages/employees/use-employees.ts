import { useMemo, useState } from "react";

import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import {
  useBulkDeleteEmployees,
  useGetEmployees,
} from "@/lib/api/employees/hooks";
import {
  type Employee,
  type GetEmployeesOptions,
} from "@/lib/api/employees/types";

import { createEmployeeColumns } from "./table";

export function useEmployees() {
  const {
    pagination,
    setPagination,
    sorting,
    handleSortingChange,
    resetPagination,
  } = useTableState({
    defaultSorting: {
      sort_by: "empl_surname",
      sort_order: "asc",
    },
  });

  const { inputValue, searchTerm, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const queryParams = useMemo<Partial<GetEmployeesOptions>>(
    () => ({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm,
      role_filter: roleFilter,
      sort_by: sorting.sort_by as GetEmployeesOptions["sort_by"],
      sort_order: sorting.sort_order ?? "asc",
    }),
    [pagination, searchTerm, roleFilter, sorting],
  );

  const { data: paginatedResponse, isLoading } = useGetEmployees(queryParams);
  const bulkDeleteMutation = useBulkDeleteEmployees();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const employees: Employee[] = paginatedResponse?.data ?? [];

  const columns = useMemo(() => createEmployeeColumns(), []);

  // Bulk delete handler for DataTable
  const handleBulkDelete = async (items: Employee[]) => {
    const employeeIds = items.map((item) => item.id_employee);
    await bulkDeleteMutation.mutateAsync({ employee_ids: employeeIds });
  };

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    selectedEmployees,
    setSelectedEmployees,
    employees,

    // Filters
    roleFilter,
    setRoleFilter,

    // Handlers
    handleSortingChange,
    resetPagination,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm: inputValue,
    setSearchTerm: handleInputChange,
    clearSearch,
    columns,
  };
}
