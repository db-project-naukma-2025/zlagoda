import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type Product = z.infer<typeof apiSchemas.Product>;
export type ProductId = Product["id_product"];

type GetProductsQueryParams = Extract<
  Api[number],
  { path: "/products/"; method: "get" }
>["parameters"];

export type GetProductsOptions = {
  [K in GetProductsQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

export type CreateProductFormData = z.infer<typeof apiSchemas.CreateProduct>;
export type UpdateProductFormData = z.infer<typeof apiSchemas.UpdateProduct>;
export type BulkDeleteRequest = z.infer<
  typeof apiSchemas.app__views__product__BulkDeleteRequest
>;

export const baseProductSchema = z.object({
  category_number: z.number().int().min(1, "Category is required"),
  product_name: z.string().min(1, "Product name is required"),
  characteristics: z.string().min(1, "Characteristics are required"),
});

export const createProductSchema: z.ZodType<CreateProductFormData> =
  baseProductSchema;

export const updateProductSchema: z.ZodType<UpdateProductFormData> =
  baseProductSchema.extend({
    id_product: z.number().int().min(1, "Product is required"),
  });
