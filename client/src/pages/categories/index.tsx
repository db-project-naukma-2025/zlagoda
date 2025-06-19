import { DataTable } from "@/components/data-table";

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
    categoriesWithId,
    handleSortingChange,
    toolbar,
  } = useCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and their information.
          </p>
        </div>
      </div>

      <DataTable
        columns={categoryColumns}
        data={categoriesWithId}
        enableDragAndDrop={false}
        enableRowSelection={true}
        getRowId={(row) => row.category_number.toString()}
        isLoading={isLoading}
        pagination={pagination}
        sorting={sorting}
        toolbar={toolbar}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSelectionChange={setSelectedCategories}
        onSortingChange={handleSortingChange}
      />
    </div>
  );
}
