import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";

import { CreateEmployeeDialog } from "./dialogs";
import { EmployeesOnlyWithPromotionalSalesReportDialog } from "./reports";
import { useEmployees } from "./use-employees";

export default function EmployeesPage() {
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.employee.can_create) ?? false;
  const canDelete = user?.scopes.includes(scopes.employee.can_delete) ?? false;
  const canEdit = user?.scopes.includes(scopes.employee.can_update) ?? false;

  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedEmployees,
    selectedEmployees,
    employees,
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    clearSearch,
    columns,
  } = useEmployees({ canDelete, canEdit });

  const createButton = canAdd ? <CreateEmployeeDialog /> : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employees</h2>
          <p className="text-muted-foreground">
            Manage employees and their information.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <EmployeesOnlyWithPromotionalSalesReportDialog />
      </div>
      <TableToolbar
        bulkDeleteItemName="employees"
        createButton={createButton}
        enableBulkDelete={canDelete}
        isBulkDeletePending={bulkDeleteMutation.isPending}
        searchValue={searchTerm}
        selectedItems={selectedEmployees}
        onBulkDelete={handleBulkDelete}
        onClearSearch={clearSearch}
        onSearch={setSearchTerm}
      />
      <DataTable
        columns={columns}
        data={employees}
        enableRowSelection={canDelete}
        isLoading={isLoading}
        keyField="id_employee"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedEmployees}
        onSortingChange={handleSortingChange}
      />
    </div>
  );
}
