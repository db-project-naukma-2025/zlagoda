import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { Combobox } from "@/components/ui/combobox";

import { useEmployees } from "./use-employees";

export default function EmployeesPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedEmployees,
    employees,
    handleSortingChange,
    toolbar,
    columns,
    roleFilter,
    setRoleFilter,
  } = useEmployees();

  const roleFilterCombobox = (
    <Combobox
      className="w-40"
      emptyMessage="No roles found."
      options={[
        { value: "all", label: "All Roles" },
        { value: "manager", label: "Manager" },
        { value: "cashier", label: "Cashier" },
      ]}
      placeholder="Filter by role"
      searchPlaceholder="Search roles..."
      value={roleFilter ?? "all"}
      onValueChange={(value) => {
        setRoleFilter(value === "all" ? undefined : value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
    />
  );

  const toolbarWithFilters = {
    ...toolbar,
    additionalFilters: [roleFilterCombobox],
  };

  return (
    <PageLayout
      description="Manage employee information and roles."
      isLoading={isLoading}
      loadingText="Loading employees..."
      title="Employees"
    >
      <DataTable
        columns={columns}
        data={employees}
        enableRowSelection={true}
        isLoading={isLoading}
        keyField="id_employee"
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbarWithFilters}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedEmployees}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
