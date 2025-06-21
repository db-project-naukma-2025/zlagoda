import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import scopes from "@/config/scopes";
import { useSearch } from "@/hooks/use-search";
import { useTableState } from "@/hooks/use-table-state";
import { useAuth } from "@/lib/api/auth";
import { useGetChecks } from "@/lib/api/checks/hooks";
import {
  type Check,
  type ChecksMetadata,
  type GetChecksOptions,
} from "@/lib/api/checks/types";
import { employeesService } from "@/lib/api/employees";
import { productsApi } from "@/lib/api/products/service";
import { storeProductsApi } from "@/lib/api/store-products/service";
import { type StoreProduct } from "@/lib/api/store-products/types";

import { createChecksColumns } from "./table";

type StoreProductWithName = StoreProduct & {
  product_name: string;
};

export function useChecks() {
  const { user } = useAuth();
  const canViewEmployees =
    user?.scopes.includes(scopes.employee.can_view) ?? false;
  const canViewProducts =
    user?.scopes.includes(scopes.store_product.can_view) ?? false;

  const {
    pagination,
    setPagination,
    sorting,
    handleSortingChange,
    resetPagination,
  } = useTableState({
    defaultSorting: {
      sort_by: "print_date",
      sort_order: "desc",
    },
  });

  const { inputValue, handleInputChange, clearSearch } = useSearch({
    onSearch: () => {
      resetPagination();
    },
  });

  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();
  const [productFilter, setProductFilter] = useState<string | undefined>();
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [viewCheck, setViewCheck] = useState<Check | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: employeesResponse } = useQuery({
    queryKey: ["employees", { limit: 1000 }],
    queryFn: () => employeesService.getEmployees({ limit: 1000 }),
    enabled: canViewEmployees,
  });

  const { data: storeProductsResponse } = useQuery({
    queryKey: ["store-products", { limit: 1000 }],
    queryFn: () => storeProductsApi.getStoreProducts({ limit: 1000 }),
    enabled: canViewProducts,
  });

  const { data: baseProductsResponse } = useQuery({
    queryKey: ["products", { limit: 1000 }],
    queryFn: () => productsApi.getProducts({ limit: 1000 }),
    enabled: canViewProducts,
  });

  const employees = useMemo(
    () => employeesResponse?.data ?? [],
    [employeesResponse?.data],
  );

  const storeProducts = useMemo(
    () => storeProductsResponse?.data ?? [],
    [storeProductsResponse?.data],
  );

  const baseProducts = useMemo(
    () => baseProductsResponse?.data ?? [],
    [baseProductsResponse?.data],
  );

  const productLookup = useMemo(() => {
    return baseProducts.reduce<Record<number, string>>((acc, product) => {
      acc[product.id_product] = product.product_name;
      return acc;
    }, {});
  }, [baseProducts]);

  const storeProductsWithNames = useMemo((): StoreProductWithName[] => {
    return storeProducts.map((storeProduct) => ({
      ...storeProduct,
      product_name:
        productLookup[storeProduct.id_product] ??
        `Product ${storeProduct.id_product.toString()}`,
    }));
  }, [storeProducts, productLookup]);

  const queryParams = useMemo<Partial<GetChecksOptions>>(
    () => ({
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      employee_id: employeeFilter,
      product_upc: productFilter,
      date_from: dateFrom,
      date_to: dateTo,
      sort_by: sorting.sort_by as GetChecksOptions["sort_by"],
      sort_order: sorting.sort_order,
    }),
    [pagination, employeeFilter, productFilter, dateFrom, dateTo, sorting],
  );

  const { data: paginatedResponse, isLoading } = useGetChecks(queryParams);

  const totalPages = Math.ceil(
    (paginatedResponse?.total ?? 0) / pagination.pageSize,
  );

  const checksData: Check[] = paginatedResponse?.data ?? [];
  const metadata: ChecksMetadata | undefined = paginatedResponse?.metadata;

  const employeeLookup = useMemo(() => {
    return employees.reduce<Record<string, string>>((acc, employee) => {
      acc[employee.id_employee] =
        `${employee.empl_surname} ${employee.empl_name}`;
      return acc;
    }, {});
  }, [employees]);

  const handleViewCheck = useCallback((check: Check) => {
    setViewCheck(check);
    setIsViewDialogOpen(true);
  }, []);

  const handleViewDialogClose = () => {
    setIsViewDialogOpen(false);
    setViewCheck(null);
  };

  const columns = useMemo(
    () =>
      createChecksColumns({
        employeeLookup,
        employees,
        onCheckClick: handleViewCheck,
        canViewEmployees,
        employeeFilter,
        setEmployeeFilter,
        resetPagination,
      }),
    [
      employeeLookup,
      employees,
      handleViewCheck,
      canViewEmployees,
      employeeFilter,
      setEmployeeFilter,
      resetPagination,
    ],
  );

  return {
    // State
    pagination,
    setPagination,
    sorting,
    isLoading,
    totalPages,
    checks: checksData,
    employees,
    storeProducts: storeProductsWithNames,
    canViewEmployees,
    canViewProducts,
    metadata,

    // Filters
    employeeFilter,
    setEmployeeFilter,
    productFilter,
    setProductFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,

    // Handlers
    handleSortingChange,
    resetPagination,
    searchTerm: inputValue,
    setSearchTerm: handleInputChange,
    clearSearch,
    columns,

    // View Check
    viewCheck,
    isViewDialogOpen,
    handleViewCheck,
    handleViewDialogClose,
    employeeLookup,
  };
}
