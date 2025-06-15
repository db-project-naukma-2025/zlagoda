import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";
import { type ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { FormDialog } from "@/components/common/form-dialog";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useBulkDeleteCategories,
  useCreateCategory,
  useDeleteCategory,
  useGetCategories,
  useUpdateCategory,
} from "@/lib/api/categories/hooks";
import {
  createCategorySchema,
  updateCategorySchema,
  type Category,
  type CategoryNumber,
  type GetCategoriesOptions,
} from "@/lib/api/categories/types";

type CategoryWithId = Category & { id: number };

function BulkDeleteCategories({
  selectedCategories,
  onSuccess,
}: {
  selectedCategories: CategoryWithId[];
  onSuccess: () => void;
}) {
  const bulkDeleteMutation = useBulkDeleteCategories();

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;

    try {
      const categoryIds = selectedCategories.map((cat) => cat.category_number);
      await bulkDeleteMutation.mutateAsync({ category_numbers: categoryIds });
      toast.success(
        `${selectedCategories.length.toString()} categories deleted successfully`,
      );
      onSuccess();
    } catch {
      toast.error("Failed to delete categories");
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description={`Are you sure you want to delete ${selectedCategories.length.toString()} selected categories? This action cannot be undone.`}
      isPending={bulkDeleteMutation.isPending}
      title="Delete Categories"
      trigger={
        <Button
          disabled={
            bulkDeleteMutation.isPending || selectedCategories.length === 0
          }
          size="sm"
          variant="destructive"
        >
          <IconTrash className="mr-2 h-4 w-4" />
          {bulkDeleteMutation.isPending
            ? "Deleting..."
            : `Delete (${selectedCategories.length.toString()})`}
        </Button>
      }
      onConfirm={() => {
        void handleBulkDelete();
      }}
    />
  );
}

function CategoryFormFields({
  form,
}: {
  form: {
    Field: React.ComponentType<{
      name: string;
      children: (field: AnyFieldApi) => React.ReactNode;
    }>;
  };
}) {
  return (
    <form.Field
      children={(field) => {
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Category Name</Label>
            <Input
              id={field.name}
              name={field.name}
              placeholder="Enter category name"
              value={field.state.value as string}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
            {field.state.meta.errors.length ? (
              <p className="text-sm font-medium text-destructive">
                {field.state.meta.errors
                  .map((error: { message?: string } | string) =>
                    typeof error === "string"
                      ? error
                      : (error.message ?? "Validation error"),
                  )
                  .join(", ")}
              </p>
            ) : null}
          </div>
        );
      }}
      name="category_name"
    />
  );
}

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateCategory();

  const form = useForm({
    defaultValues: {
      category_name: "",
    },
    validators: {
      onChange: createCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        toast.success("Category created successfully");
        form.reset();
        setOpen(false);
      } catch {
        toast.error("Failed to create category");
      }
    },
  });

  return (
    <FormDialog
      description="Add a new category to organize your products."
      isPending={createMutation.isPending}
      open={open}
      submitText="Create"
      title="Create Category"
      trigger={
        <Button size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      }
      onOpenChange={setOpen}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CategoryFormFields form={form} />
    </FormDialog>
  );
}

function EditCategoryDialog({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryWithId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateMutation = useUpdateCategory();

  const form = useForm({
    defaultValues: {
      category_name: category.category_name,
    },
    validators: {
      onChange: updateCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: category.category_number,
          data: value,
        });
        toast.success("Category updated successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to update category");
      }
    },
  });

  return (
    <FormDialog
      description="Update the category information."
      isPending={updateMutation.isPending}
      key={`${category.category_number.toString()}-${open.toString()}`}
      open={open}
      submitText="Update"
      title="Edit Category"
      onOpenChange={onOpenChange}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CategoryFormFields form={form} />
    </FormDialog>
  );
}

function DeleteCategoryDialog({
  categoryId,
  open,
  onOpenChange,
}: {
  categoryId: CategoryNumber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteMutation = useDeleteCategory();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      toast.success("Category deleted successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <ConfirmationDialog
      confirmButtonVariant="destructive"
      confirmText="Delete"
      description="Are you sure you want to delete this category? This action cannot be undone."
      isPending={deleteMutation.isPending}
      open={open}
      title="Delete Category"
      onConfirm={() => {
        void handleDelete();
      }}
      onOpenChange={onOpenChange}
    />
  );
}

function SearchInput({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9 pr-9"
        placeholder="Search categories..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
      {value && (
        <Button
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          size="icon"
          variant="ghost"
          onClick={onClear}
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

const columns: ColumnDef<CategoryWithId>[] = [
  {
    accessorKey: "category_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category_number")}</Badge>
    ),
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("category_name")}</div>
    ),
    enableHiding: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: function Cell({ row }) {
      const category = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

      return (
        <>
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="data-[state=open]:bg-muted"
                  size="icon"
                  variant="ghost"
                >
                  <IconDotsVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onSelect={() => {
                    setIsEditOpen(true);
                  }}
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    setIsDeleteOpen(true);
                  }}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <EditCategoryDialog
            category={category}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
          <DeleteCategoryDialog
            categoryId={category.category_number}
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
          />
        </>
      );
    },
  },
];

export default function CategoriesPage() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<{
    sort_by: GetCategoriesOptions["sort_by"];
    sort_order: GetCategoriesOptions["sort_order"];
  }>({
    sort_by: "category_number",
    sort_order: "desc",
  });

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchTerm(value.trim());
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, 500);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    debouncedSearch.cancel();
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const handleSortingChange = (newSorting: {
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }) => {
    setSorting((prev) => ({
      sort_by: newSorting.sort_by as GetCategoriesOptions["sort_by"],
      sort_order: newSorting.sort_order ?? prev.sort_order,
    }));
  };

  const queryParams = useMemo<Partial<GetCategoriesOptions>>(
    () => ({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      search: searchTerm || undefined,
      sort_by: sorting.sort_by,
      sort_order: sorting.sort_order,
    }),
    [pagination, searchTerm, sorting],
  );

  const { data: paginatedResponse, isLoading } = useGetCategories(queryParams);

  const totalPages = paginatedResponse?.total_pages ?? 0;

  const [selectedCategories, setSelectedCategories] = useState<
    CategoryWithId[]
  >([]);

  const categoriesWithId: CategoryWithId[] =
    paginatedResponse?.data.map((category) => ({
      ...category,
      id: category.category_number,
    })) ?? [];

  const toolbar = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <div className="w-64">
          <SearchInput
            value={inputValue}
            onChange={handleInputChange}
            onClear={clearSearch}
          />
        </div>
        {selectedCategories.length > 0 && (
          <BulkDeleteCategories
            selectedCategories={selectedCategories}
            onSuccess={() => {
              setSelectedCategories([]);
            }}
          />
        )}
        <CreateCategoryDialog />
      </div>
    ),
    [inputValue, handleInputChange, clearSearch, selectedCategories],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and category hierarchy.
          </p>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-muted-foreground">
            Manage product categories and category hierarchy.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
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
