import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeeQueryKeys, employeesService } from "./service";
import {
  type BulkDeleteEmployeeRequest,
  type CreateEmployeeFormData,
  type EmployeeId,
  type GetEmployeesOptions,
  type UpdateEmployeeFormData,
} from "./types";

export function useGetEmployees(options: Partial<GetEmployeesOptions> = {}) {
  return useQuery({
    queryKey: employeeQueryKeys.list(options),
    queryFn: () => employeesService.getEmployees(options),
  });
}

export function useGetEmployee(id: EmployeeId) {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id),
    queryFn: () => employeesService.getEmployee(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeFormData) =>
      employeesService.createEmployee(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all(),
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: EmployeeId;
      data: UpdateEmployeeFormData;
    }) => employeesService.updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all(),
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: EmployeeId) => employeesService.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all(),
      });
    },
  });
}

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteEmployeeRequest) =>
      employeesService.bulkDeleteEmployees(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.all(),
      });
    },
  });
}

export function useGetEmployeesOnlyWithPromotionalSales() {
  return useQuery({
    queryKey: employeeQueryKeys.reports(),
    queryFn: () => employeesService.getEmployeesOnlyWithPromotionalSales(),
  });
}
