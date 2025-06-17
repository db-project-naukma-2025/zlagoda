import { apiClient } from "@/lib/api/client";

import {
  type BulkDeleteRequest,
  type CreateProductFormData,
  type GetProductsOptions,
  type ProductId,
  type UpdateProductFormData,
} from "./types";

export const productQueryKeys = {
  all: () => ["products"] as const,
  list: (params?: Partial<GetProductsOptions>) =>
    [...productQueryKeys.all(), "list", params] as const,
  detail: (id: ProductId) => [...productQueryKeys.all(), "detail", id] as const,
};

export const productsApi = {
  async getProducts(params?: Partial<GetProductsOptions>) {
    return apiClient.getProducts({
      queries: params ?? {},
    });
  },

  async getProduct(id_product: ProductId) {
    return apiClient.getProduct({
      params: { id_product },
    });
  },

  async createProduct(data: CreateProductFormData) {
    return apiClient.createProduct(data);
  },

  async updateProduct(id_product: ProductId, data: UpdateProductFormData) {
    return apiClient.updateProduct(data, {
      params: { id_product },
    });
  },

  async deleteProduct(id_product: ProductId) {
    return apiClient.deleteProduct(undefined, {
      params: { id_product },
    });
  },

  async bulkDeleteProducts(request: BulkDeleteRequest) {
    return apiClient.bulkDeleteProducts(request);
  },
};
