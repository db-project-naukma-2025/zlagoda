import { apiClient } from "../client";

import {
  type BulkDeleteRequest,
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

  async bulkDeleteEmployees(data: BulkDeleteRequest) {
    return apiClient.bulkDeleteEmployees(data);
  },
};
