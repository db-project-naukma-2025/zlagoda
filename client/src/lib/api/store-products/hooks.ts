import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";

import { storeProductQueryKeys, storeProductsApi } from "./service";
import {
  type BulkDeleteRequest,
  type CreateStoreProductFormData,
  type GetStoreProductsOptions,
  type StoreProductUPC,
  type UpdateStoreProductFormData,
} from "./types";

export const useGetStoreProducts = (
  params?: Partial<GetStoreProductsOptions>,
) => {
  return useApiQuery({
    queryKey: storeProductQueryKeys.list(params),
    queryFn: () => storeProductsApi.getStoreProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetStoreProduct = (upc: StoreProductUPC) => {
  return useApiQuery({
    queryKey: storeProductQueryKeys.detail(upc),
    queryFn: () => storeProductsApi.getStoreProduct(upc),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateStoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreProductFormData) =>
      storeProductsApi.createStoreProduct(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storeProductQueryKeys.all(),
      });
    },
  });
};

export const useUpdateStoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      upc,
      data,
    }: {
      upc: StoreProductUPC;
      data: UpdateStoreProductFormData;
    }) => storeProductsApi.updateStoreProduct(upc, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storeProductQueryKeys.all(),
      });
    },
  });
};

export const useDeleteStoreProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (upc: StoreProductUPC) =>
      storeProductsApi.deleteStoreProduct(upc),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storeProductQueryKeys.all(),
      });
    },
  });
};

export const useBulkDeleteStoreProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkDeleteRequest) =>
      storeProductsApi.bulkDeleteStoreProducts(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: storeProductQueryKeys.all(),
      });
    },
  });
};
