import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { PrintButton } from "@/components/print-button";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";
import { type GetEmployeesOptions } from "@/lib/api/employees/types";

import { CreateEmployeeDialog } from "./dialogs";
import { EmployeesOnlyWithPromotionalSalesReportDialog } from "./reports";
import { useEmployees } from "./use-employees";

export default function EmployeesPage() {
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.employee.can_create) ?? false;
  const canDelete = user?.scopes.includes(scopes.employee.can_delete) ?? false;
  const canEdit = user?.scopes.includes(scopes.employee.can_update) ?? false;
  const canPrintToPdf =
    user?.scopes.includes(scopes.employee.print_to_pdf) ?? false;

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
    roleFilter,
  } = useEmployees({ canDelete, canEdit });

  const { data: printData } = useEmployees({
    printMode: true,
    canDelete: false,
    canEdit: false,
    roleFilter,
    sortBy: sorting.sort_by as GetEmployeesOptions["sort_by"],
    sortOrder: sorting.sort_order,
  });

  const createButton = canAdd ? <CreateEmployeeDialog /> : null;

  return (
    <PageLayout
      description="Manage employees and their information."
      title="Employees"
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {canPrintToPdf && (
            <PrintButton
              columns={columns}
              data={printData}
              tableType="standard"
              title="Employees"
            />
          )}
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
      </div>
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
    </PageLayout>
  );
}
