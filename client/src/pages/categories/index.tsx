import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { TableToolbar } from "@/components/table-toolbar";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";

import { CreateCategoryDialog } from "./dialogs";
import {
  AllProductsSoldReportDialog,
  CategoryRevenueReportDialog,
} from "./reports";
import { createCategoryColumns } from "./table";
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
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.category.can_create) ?? false;
  const canDelete = user?.scopes.includes(scopes.category.can_delete) ?? false;
  const canEdit = user?.scopes.includes(scopes.category.can_update) ?? false;

  const categoryColumns = createCategoryColumns(canDelete, canEdit);

  const createButton = canAdd ? <CreateCategoryDialog /> : null;

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
        <TableToolbar
          bulkDeleteItemName="categories"
          createButton={createButton}
          enableBulkDelete={canDelete}
          isBulkDeletePending={bulkDeleteMutation.isPending}
          searchValue={searchTerm}
          selectedItems={selectedCategories}
          onBulkDelete={handleBulkDelete}
          onClearSearch={clearSearch}
          onSearch={setSearchTerm}
        />
      </div>
      <DataTable
        columns={categoryColumns}
        data={categories}
        enableRowSelection={canDelete}
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
