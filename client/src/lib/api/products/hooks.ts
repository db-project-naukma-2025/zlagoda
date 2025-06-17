import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";

import { productQueryKeys, productsApi } from "./service";
import {
  type BulkDeleteRequest,
  type CreateProductFormData,
  type GetProductsOptions,
  type ProductId,
  type UpdateProductFormData,
} from "./types";

export const useGetProducts = (params?: Partial<GetProductsOptions>) => {
  return useApiQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetProduct = (productId: ProductId) => {
  return useApiQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => productsApi.getProduct(productId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductFormData) =>
      productsApi.createProduct(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: ProductId;
      data: UpdateProductFormData;
    }) => productsApi.updateProduct(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: ProductId) => productsApi.deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all() });
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkDeleteRequest) =>
      productsApi.bulkDeleteProducts(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all() });
    },
  });
};
