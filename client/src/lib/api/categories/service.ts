import { apiClient } from "@/lib/api/client";

import {
  type BulkDeleteCategoryRequest,
  type CategoryNumber,
  type CreateCategoryFormData,
  type GetCategoriesOptions,
  type UpdateCategoryFormData,
} from "./types";

export const categoryQueryKeys = {
  all: () => ["categories"] as const,
  list: (params?: Partial<GetCategoriesOptions>) =>
    [...categoryQueryKeys.all(), "list", params] as const,
  detail: (id: CategoryNumber) =>
    [...categoryQueryKeys.all(), "detail", id] as const,
};

export const categoriesApi = {
  async getCategories(params?: Partial<GetCategoriesOptions>) {
    return apiClient.getCategories({
      queries: params ?? {},
    });
  },

  async getCategory(categoryNumber: CategoryNumber) {
    return apiClient.getCategory({
      params: { category_number: categoryNumber },
    });
  },

  async createCategory(data: CreateCategoryFormData) {
    return apiClient.createCategory(data);
  },

  async updateCategory(
    categoryNumber: CategoryNumber,
    data: UpdateCategoryFormData,
  ) {
    return apiClient.updateCategory(data, {
      params: { category_number: categoryNumber },
    });
  },

  async deleteCategory(categoryNumber: CategoryNumber) {
    return apiClient.deleteCategory(undefined, {
      params: { category_number: categoryNumber },
    });
  },

  async bulkDeleteCategories(request: BulkDeleteCategoryRequest) {
    return apiClient.bulkDeleteCategories(request);
  },
};
