import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type StoreProduct = z.infer<typeof apiSchemas.StoreProduct>;
export type CreateStoreProductFormData = z.infer<
  typeof apiSchemas.CreateStoreProduct
>;
export type UpdateStoreProductFormData = z.infer<
  typeof apiSchemas.UpdateStoreProduct
>;
export type CreatePromotionalProductFormData = z.infer<
  typeof apiSchemas.CreatePromotionalProduct
>;

export type StoreProductUPC = string;

export type BulkDeleteRequest = z.infer<
  typeof apiSchemas.app__views__store_product__BulkDeleteRequest
>;

type GetStoreProductsQueryParams = Extract<
  Api[number],
  { path: "/store-products/"; method: "get" }
>["parameters"];

export type GetStoreProductsOptions = {
  [K in GetStoreProductsQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

const upcSchema = z
  .string()
  .min(12, "UPC must be 12 characters")
  .max(12, "UPC must be 12 characters");

const baseStoreProductSchema = z.object({
  UPC_prom: z.union([upcSchema, z.null()]),
  id_product: z.number().int().min(1, "Product is required"),
  selling_price: z.number().min(0.01, "Selling price must be greater than 0"),
  products_number: z
    .number()
    .int()
    .min(0, "Products number must be non-negative"),
  promotional_product: z.boolean(),
});

export const createStoreProductSchema: z.ZodType<CreateStoreProductFormData> =
  baseStoreProductSchema.extend({
    UPC: upcSchema,
  });

export const updateStoreProductSchema: z.ZodType<UpdateStoreProductFormData> =
  baseStoreProductSchema;

export const createPromotionalProductSchema: z.ZodType<CreatePromotionalProductFormData> =
  z.object({
    promotional_UPC: upcSchema,
    units: z.number().min(1, "Units must be greater than 0"),
    operation_type: z.enum(["convert", "add"]),
  });
