import { DataTable } from "@/components/data-table";

import { customerCardColumns } from "./table";
import { useCustomerCards } from "./use-customer-cards";

/**
 * Renders the customer cards management page with a data table for viewing, sorting, paginating, and selecting customer cards.
 *
 * Displays a header and a table of customer cards with interactive features such as row selection, pagination, and sorting.
 */
export default function CustomerCardsPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedCustomerCards,
    customerCardsWithId,
    handleSortingChange,
    toolbar,
  } = useCustomerCards();

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

      <DataTable
        columns={customerCardColumns}
        data={customerCardsWithId}
        enableDragAndDrop={false}
        enableRowSelection={true}
        getRowId={(row) => row.card_number}
        isLoading={isLoading}
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbar}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedCustomerCards}
        onSortingChange={handleSortingChange}
      />
    </div>
  );
}
