import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type StoreProduct = z.infer<typeof apiSchemas.StoreProduct>;
export type StoreProductUPC = StoreProduct["UPC"];

type GetStoreProductsQueryParams = Extract<
  Api[number],
  { path: "/store-products/"; method: "get" }
>["parameters"];

export type GetStoreProductsOptions = {
  [K in GetStoreProductsQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

export type CreateStoreProductFormData = z.infer<
  typeof apiSchemas.CreateStoreProductRequest
>;
export type UpdateStoreProductFormData = z.infer<
  typeof apiSchemas.UpdateStoreProductRequest
>;
export type BulkDeleteRequest = z.infer<
  typeof apiSchemas.app__views__store_product__BulkDeleteRequest
>;

// Schemas with validation messages
export const createStoreProductSchema: z.ZodType<CreateStoreProductFormData> =
  z.object({
    UPC: z
      .string()
      .min(1, "UPC is required")
      .max(12, "UPC must be 12 characters or less"),
    UPC_prom: z
      .string()
      .max(12, "Promotional UPC must be 12 characters or less")
      .optional()
      .nullable(),
    id_product: z.number().int().min(1, "Product is required"),
    selling_price: z
      .union([z.number(), z.string()])
      .pipe(
        z.coerce.number().min(0.01, "Selling price must be greater than 0"),
      ),
    products_number: z
      .number()
      .int()
      .min(0, "Products number must be non-negative"),
    promotional_product: z.boolean(),
  });

export const updateStoreProductSchema: z.ZodType<UpdateStoreProductFormData> =
  z.object({
    UPC_prom: z
      .string()
      .max(12, "Promotional UPC must be 12 characters or less")
      .optional()
      .nullable(),
    id_product: z.number().int().min(1, "Product is required"),
    selling_price: z
      .union([z.number(), z.string()])
      .pipe(
        z.coerce.number().min(0.01, "Selling price must be greater than 0"),
      ),
    products_number: z
      .number()
      .int()
      .min(0, "Products number must be non-negative"),
    promotional_product: z.boolean(),
  });
