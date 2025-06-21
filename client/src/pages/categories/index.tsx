import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { TableToolbar } from "@/components/table-toolbar";

import { CreateCategoryDialog } from "./dialogs";
import {
  AllProductsSoldReportDialog,
  CategoryRevenueReportDialog,
} from "./reports";
import { categoryColumns } from "./table";
import { useCategories } from "./use-categories";

export default function CategoriesPage() {
  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    setSelectedCategories,
    selectedCategories,
    categories,
    handleSortingChange,
    handleBulkDelete,
    bulkDeleteMutation,
    searchTerm,
    setSearchTerm,
    clearSearch,
  } = useCategories();

  const createButton = <CreateCategoryDialog />;

  return (
    <PageLayout
      description="Manage product categories and classifications."
      title="Categories"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <CategoryRevenueReportDialog />
          <AllProductsSoldReportDialog />
        </div>
        <div className="flex-1 max-w-md ml-4">
          <TableToolbar
            bulkDeleteItemName="categories"
            createButton={createButton}
            isBulkDeletePending={bulkDeleteMutation.isPending}
            searchValue={searchTerm}
            selectedItems={selectedCategories}
            onBulkDelete={handleBulkDelete}
            onClearSearch={clearSearch}
            onSearch={setSearchTerm}
          />
        </div>
      </div>
      <DataTable
        columns={categoryColumns}
        data={categories}
        enableRowSelection={true}
        isLoading={isLoading}
        keyField="category_number"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedCategories}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
