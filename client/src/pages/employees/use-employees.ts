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

interface UseEmployeesOptions {
  canDelete: boolean;
  canEdit: boolean;
  printMode?: boolean;
  roleFilter?: string | undefined;
  sortBy?: GetEmployeesOptions["sort_by"];
  sortOrder?: GetEmployeesOptions["sort_order"] | undefined;
}

export function useEmployees({
  canDelete,
  canEdit,
  printMode = false,
  roleFilter: externalRoleFilter,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
}: UseEmployeesOptions) {
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

  const [internalRoleFilter, setRoleFilter] = useState<string | undefined>();

  // Use external filters if provided (for print mode), otherwise use internal state
  const roleFilter = externalRoleFilter ?? internalRoleFilter;

  const queryParams = useMemo<Partial<GetEmployeesOptions>>(
    () => ({
      // In print mode, skip pagination and get all results
      skip: printMode ? 0 : pagination.pageIndex * pagination.pageSize,
      limit: printMode ? null : pagination.pageSize,
      search: searchTerm,
      role_filter: roleFilter,
      sort_by: (externalSortBy ??
        sorting.sort_by) as GetEmployeesOptions["sort_by"],
      sort_order: externalSortOrder ?? sorting.sort_order ?? "asc",
    }),
    [
      pagination,
      searchTerm,
      roleFilter,
      sorting,
      printMode,
      externalSortBy,
      externalSortOrder,
    ],
  );

  const {
    data: paginatedResponse,
    isLoading,
    refetch,
  } = useGetEmployees(queryParams);
  const bulkDeleteMutation = useBulkDeleteEmployees();

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  const employees: Employee[] = useMemo(
    () => paginatedResponse?.data ?? [],
    [paginatedResponse?.data],
  );

  const columns = useMemo(
    () =>
      createEmployeeColumns({
        canDelete,
        canEdit,
        roleFilter,
        setRoleFilter,
        employees,
        resetPagination,
      }),
    [canDelete, canEdit, roleFilter, setRoleFilter, employees, resetPagination],
  );

  const handleBulkDelete = async (items: Employee[]) => {
    const employeeIds = items.map((item) => item.id_employee);
    await bulkDeleteMutation.mutateAsync({ ids: employeeIds });
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

    // Print-specific data
    data: employees, // Alias for print compatibility
    total: paginatedResponse?.total ?? 0,

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
    refetch,
  };
}
