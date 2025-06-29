import { useMemo } from "react";

import { ChecksMetadataDisplay } from "@/components/checks-metadata";
import { DataTable } from "@/components/data-table";
import { PageLayout } from "@/components/layout/page-layout";
import { PrintButton } from "@/components/print-button";
import { TableToolbar } from "@/components/table-toolbar";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import scopes from "@/config/scopes";
import { useAuth } from "@/lib/api/auth";
import { type GetChecksOptions } from "@/lib/api/checks/types";
import { type Employee } from "@/lib/api/employees/types";
import { type StoreProduct } from "@/lib/api/store-products/types";

import { CreateCheckDialog, ViewCheckDialog } from "./dialogs";
import { useChecks } from "./use-checks";

type StoreProductWithName = StoreProduct & {
  product_name: string;
};

const createProductOptions = (storeProducts: StoreProductWithName[]) => {
  return storeProducts.map((storeProduct) => ({
    value: storeProduct.UPC,
    label: storeProduct.product_name,
    subtitle: storeProduct.UPC,
    searchText: `${storeProduct.product_name} ${storeProduct.UPC}`,
  }));
};

export default function ChecksPage() {
  const { user } = useAuth();
  const canAdd = user?.scopes.includes(scopes.check.can_create) ?? false;
  const canPrintToPdf =
    user?.scopes.includes(scopes.check.print_to_pdf) ?? false;

  const {
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    checks,
    employees,
    storeProducts,
    canViewEmployees,
    canViewProducts,
    metadata,
    employeeFilter,
    setEmployeeFilter,
    productFilter,
    setProductFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    handleSortingChange,
    searchTerm,
    setSearchTerm,
    clearSearch,
    columns,
    viewCheck,
    isViewDialogOpen,
    handleViewDialogClose,
    employeeLookup,
  } = useChecks();

  const productLookup = useMemo(() => {
    const lookup: Record<string, string> = {};
    for (const storeProduct of storeProducts) {
      lookup[storeProduct.UPC] = storeProduct.product_name;
    }
    return lookup;
  }, [storeProducts]);

  const { data: allChecks } = useChecks({
    printMode: true,
    employeeFilter,
    productFilter,
    dateFrom,
    dateTo,
    sortBy: sorting.sort_by as GetChecksOptions["sort_by"],
    sortOrder: sorting.sort_order,
  });

  const filterContext = useMemo(() => {
    const context: {
      productName?: string;
      employeeName?: string;
      dateRange?: string;
    } = {};

    if (productFilter) {
      const selectedProduct = storeProducts.find(
        (p) => p.UPC === productFilter,
      );
      if (selectedProduct) {
        context.productName = selectedProduct.product_name;
      }
    }

    if (employeeFilter) {
      context.employeeName = employeeLookup[employeeFilter] ?? "";
    }

    if (dateFrom || dateTo) {
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
      };

      if (dateFrom && dateTo) {
        context.dateRange = `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
      } else if (dateFrom) {
        context.dateRange = `From ${formatDate(dateFrom)}`;
      } else if (dateTo) {
        context.dateRange = `Until ${formatDate(dateTo)}`;
      }
    }

    return Object.keys(context).length > 0 ? context : undefined;
  }, [
    productFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    storeProducts,
    employeeLookup,
  ]);

  const additionalFilters = [];

  if (canViewEmployees) {
    const employeeFilterCombobox = (
      <Combobox
        className="w-48"
        emptyMessage="No employees found."
        options={[
          { value: "all", label: "All Employees" },
          ...employees.map((employee: Employee) => ({
            value: employee.id_employee,
            label: `${employee.empl_surname} ${employee.empl_name}`,
            searchText: `${employee.empl_surname} ${employee.empl_name}`,
          })),
        ]}
        placeholder="Filter by employee"
        value={employeeFilter ?? "all"}
        onValueChange={(value) => {
          setEmployeeFilter(value === "all" ? undefined : value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      />
    );
    additionalFilters.push(employeeFilterCombobox);
  }

  if (canViewProducts) {
    const productFilterCombobox = (
      <Combobox
        className="w-64"
        emptyMessage="No products found."
        options={[
          { value: "all", label: "All Products" },
          ...createProductOptions(storeProducts),
        ]}
        placeholder="Filter by product"
        searchPlaceholder="Search products..."
        value={productFilter ?? "all"}
        onValueChange={(value) => {
          setProductFilter(value === "all" ? undefined : value);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      />
    );
    additionalFilters.push(productFilterCombobox);
  }

  const dateRangeFilter = (
    <DateRangePicker
      dateFrom={dateFrom ?? undefined}
      dateTo={dateTo ?? undefined}
      onDateFromChange={(date) => {
        setDateFrom(date ?? undefined);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
      onDateToChange={(date) => {
        setDateTo(date ?? undefined);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }}
    />
  );
  additionalFilters.push(dateRangeFilter);

  const createButton = canAdd ? <CreateCheckDialog /> : null;

  const tableToolbar = (
    <TableToolbar
      additionalFilters={additionalFilters}
      createButton={createButton}
      enableBulkDelete={false}
      searchValue={searchTerm}
      selectedItems={[]}
      onClearSearch={clearSearch}
      onSearch={setSearchTerm}
    />
  );

  let toolbar;
  if (canPrintToPdf) {
    toolbar = (
      <>
        <div className="flex justify-between items-center">
          <PrintButton
            data={allChecks}
            employeeLookup={employeeLookup}
            filterContext={filterContext}
            productLookup={productLookup}
            tableType="checks"
            title="Checks Report"
          />
          {tableToolbar}
        </div>
      </>
    );
  } else {
    toolbar = tableToolbar;
  }

  return (
    <PageLayout
      description="Manage sales receipts and transactions."
      isLoading={isLoading}
      loadingText="Loading checks..."
      title="Checks"
    >
      <ChecksMetadataDisplay
        filterContext={filterContext}
        metadata={metadata}
      />
      {toolbar}
      <DataTable
        columns={columns}
        data={checks}
        enableRowSelection={false}
        isLoading={isLoading}
        keyField="check_number"
        pagination={pagination}
        sorting={sorting}
        totalPages={totalPages}
        onPaginationChange={setPagination}
        onSortingChange={handleSortingChange}
      />

      <ViewCheckDialog
        canViewEmployees={canViewEmployees}
        check={viewCheck}
        employeeLookup={employeeLookup}
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogClose}
      />
    </PageLayout>
  );
}
