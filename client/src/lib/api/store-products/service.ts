import { apiClient } from "@/lib/api/client";

import {
  type BulkDeleteRequest,
  type CreateStoreProductFormData,
  type GetStoreProductsOptions,
  type StoreProductUPC,
  type UpdateStoreProductFormData,
} from "./types";

export const storeProductQueryKeys = {
  all: () => ["store-products"] as const,
  list: (params?: Partial<GetStoreProductsOptions>) =>
    [...storeProductQueryKeys.all(), "list", params] as const,
  detail: (upc: StoreProductUPC) =>
    [...storeProductQueryKeys.all(), "detail", upc] as const,
};

export const storeProductsApi = {
  async getStoreProducts(params?: Partial<GetStoreProductsOptions>) {
    return apiClient.getStoreProducts({
      queries: params ?? {},
    });
  },

  async getStoreProduct(upc: StoreProductUPC) {
    return apiClient.getStoreProduct({
      params: { upc },
    });
  },

  async createStoreProduct(data: CreateStoreProductFormData) {
    return apiClient.createStoreProduct(data);
  },

  async updateStoreProduct(
    upc: StoreProductUPC,
    data: UpdateStoreProductFormData,
  ) {
    return apiClient.updateStoreProduct(data, {
      params: { upc },
    });
  },

  async deleteStoreProduct(upc: StoreProductUPC) {
    return apiClient.deleteStoreProduct(undefined, {
      params: { upc },
    });
  },

  async bulkDeleteStoreProducts(request: BulkDeleteRequest) {
    return apiClient.bulkDeleteStoreProducts(request);
  },
};
