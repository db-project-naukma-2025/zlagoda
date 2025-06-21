import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";

import { categoriesApi, categoryQueryKeys } from "./service";
import {
  type BulkDeleteCategoryRequest,
  type CategoryNumber,
  type CreateCategoryFormData,
  type GetCategoriesOptions,
  type UpdateCategoryFormData,
} from "./types";

export const useGetCategories = (params?: Partial<GetCategoriesOptions>) => {
  return useApiQuery({
    queryKey: categoryQueryKeys.list(params),
    queryFn: () => categoriesApi.getCategories(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetCategory = (categoryNumber: CategoryNumber) => {
  return useApiQuery({
    queryKey: categoryQueryKeys.detail(categoryNumber),
    queryFn: () => categoriesApi.getCategory(categoryNumber),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryFormData) =>
      categoriesApi.createCategory(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: CategoryNumber;
      data: UpdateCategoryFormData;
    }) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all() });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: CategoryNumber) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all() });
    },
  });
};

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkDeleteCategoryRequest) =>
      categoriesApi.bulkDeleteCategories(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all() });
    },
  });
};

export const useGetCategoryRevenueReport = (
  dateFrom?: string,
  dateTo?: string,
  enabled = true,
) => {
  return useApiQuery({
    queryKey: categoryQueryKeys.revenueReport(dateFrom, dateTo),
    queryFn: () => categoriesApi.getCategoryRevenueReport(dateFrom, dateTo),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

export const useGetCategoriesWithAllProductsSold = (enabled = true) => {
  return useApiQuery({
    queryKey: categoryQueryKeys.allProductsSoldReport(),
    queryFn: () => categoriesApi.getCategoriesWithAllProductsSold(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};
