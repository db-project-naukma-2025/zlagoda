import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/table-toolbar";

import { CreateCustomerDialog } from "./dialogs";
import { customerCardColumns } from "./table";
import { useCustomerCards } from "./use-customer-cards";

export default function CustomerCardsPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedCustomerCards,
    selectedCustomerCards,
    customerCards,
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    clearSearch,
  } = useCustomerCards();

  const createButton = <CreateCustomerDialog />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Cards</h2>
          <p className="text-muted-foreground">
            Manage customer cards and their information.
          </p>
        </div>
      </div>
      <TableToolbar
        bulkDeleteItemName="customer cards"
        createButton={createButton}
        isBulkDeletePending={bulkDeleteMutation.isPending}
        searchValue={searchTerm}
        selectedItems={selectedCustomerCards}
        onBulkDelete={handleBulkDelete}
        onClearSearch={clearSearch}
        onSearch={setSearchTerm}
      />
      <DataTable
        columns={customerCardColumns}
        data={customerCards}
        enableRowSelection={true}
        isLoading={isLoading}
        keyField="card_number"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedCustomerCards}
        onSortingChange={handleSortingChange}
      />
    </div>
  );
}
