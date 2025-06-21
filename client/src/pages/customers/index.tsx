import { DataTable } from "@/components/data-table";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";

import { CreateCustomerDialog } from "./dialogs";
import { CardSoldCategoriesReportDialog } from "./reports";
import { createCustomerCardColumns } from "./table";
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

  const { user } = useAuth();
  const canAdd =
    user?.scopes.includes(scopes.customer_card.can_create) ?? false;
  const canDelete =
    user?.scopes.includes(scopes.customer_card.can_delete) ?? false;
  const canEdit =
    user?.scopes.includes(scopes.customer_card.can_update) ?? false;

  const customerCardColumns = createCustomerCardColumns(canDelete, canEdit);

  const createButton = canAdd ? <CreateCustomerDialog /> : null;

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
      <div className="flex gap-2">
        <CardSoldCategoriesReportDialog />
      </div>
      <TableToolbar
        bulkDeleteItemName="customer cards"
        createButton={createButton}
        enableBulkDelete={canDelete}
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
        enableRowSelection={canDelete}
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
