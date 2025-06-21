import { apiClient } from "../client";

import {
  type BulkDeleteEmployeeRequest,
  type CreateEmployeeFormData,
  type EmployeeId,
  type GetEmployeesOptions,
  type UpdateEmployeeFormData,
} from "./types";

export const employeeQueryKeys = {
  all: () => ["employees"] as const,
  list: (params?: Partial<GetEmployeesOptions>) =>
    [...employeeQueryKeys.all(), "list", params] as const,
  detail: (id: EmployeeId) =>
    [...employeeQueryKeys.all(), "detail", id] as const,
  me: () => [...employeeQueryKeys.all(), "me"] as const,
  reports: () => [...employeeQueryKeys.all(), "reports"] as const,
};

export const employeesService = {
  async getEmployees(options: Partial<GetEmployeesOptions> = {}) {
    return apiClient.getEmployees({
      queries: options,
    });
  },

  async getEmployee(id: EmployeeId) {
    return apiClient.getEmployee({
      params: { id_employee: id },
    });
  },

  async getMyEmployee() {
    return apiClient.getMyEmployee();
  },

  async createEmployee(data: CreateEmployeeFormData) {
    return apiClient.createEmployee(data);
  },

  async updateEmployee(id: EmployeeId, data: UpdateEmployeeFormData) {
    return apiClient.updateEmployee(data, {
      params: { id_employee: id },
    });
  },

  async deleteEmployee(id: EmployeeId) {
    return apiClient.deleteEmployee(undefined, {
      params: { id_employee: id },
    });
  },

  async bulkDeleteEmployees(data: BulkDeleteEmployeeRequest) {
    return apiClient.bulkDeleteEmployees(data);
  },

  async getEmployeesOnlyWithPromotionalSales() {
    return apiClient.getEmployeesOnlyWithPromotionalSales();
  },
};
