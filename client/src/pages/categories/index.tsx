import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";

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
    categories,
    handleSortingChange,
    toolbar,
  } = useCategories();

  return (
    <PageLayout
      description="Manage product categories and classifications."
      isLoading={isLoading}
      loadingText="Loading categories..."
      title="Categories"
    >
      <DataTable
        columns={categoryColumns}
        data={categories}
        enableRowSelection={true}
        isLoading={isLoading}
        keyField="category_number"
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbar}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedCategories}
        onSortingChange={handleSortingChange}
      />
    </PageLayout>
  );
}
