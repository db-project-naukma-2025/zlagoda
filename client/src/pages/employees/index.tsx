import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/table-toolbar";

import { CreateEmployeeDialog } from "./dialogs";
import { useEmployees } from "./use-employees";

export default function EmployeesPage() {
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
  } = useEmployees();

  const createButton = <CreateEmployeeDialog />;

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
      <TableToolbar
        bulkDeleteItemName="employees"
        createButton={createButton}
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
        enableRowSelection={true}
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
