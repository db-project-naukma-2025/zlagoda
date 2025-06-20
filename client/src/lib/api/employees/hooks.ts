import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { employeesService } from "./service";
import {
  type BulkDeleteRequest,
  type CreateEmployeeFormData,
  type EmployeeId,
  type GetEmployeesOptions,
  type UpdateEmployeeFormData,
} from "./types";

const EMPLOYEES_QUERY_KEY = "employees";

export function useGetEmployees(options: Partial<GetEmployeesOptions> = {}) {
  return useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, options],
    queryFn: () => employeesService.getEmployees(options),
  });
}

export function useGetEmployee(id: EmployeeId) {
  return useQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, id],
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
        queryKey: [EMPLOYEES_QUERY_KEY],
      });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: EmployeeId; data: UpdateEmployeeFormData }) =>
      employeesService.updateEmployee(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_QUERY_KEY],
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
        queryKey: [EMPLOYEES_QUERY_KEY],
      });
    },
  });
}

export function useBulkDeleteEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDeleteRequest) =>
      employeesService.bulkDeleteEmployees(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [EMPLOYEES_QUERY_KEY],
      });
    },
  });
} 