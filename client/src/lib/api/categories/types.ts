import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type Category = z.infer<typeof apiSchemas.Category>;
export type CategoryNumber = Category["category_number"];

type GetCategoriesQueryParams = Extract<
  Api[number],
  { path: "/categories/"; method: "get" }
>["parameters"];

export type GetCategoriesOptions = {
  [K in GetCategoriesQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

export type CreateCategoryFormData = z.infer<
  typeof apiSchemas.CreateCategoryRequest
>;
export type UpdateCategoryFormData = z.infer<
  typeof apiSchemas.UpdateCategoryRequest
>;
export type BulkDeleteCategoryRequest = z.infer<
  typeof apiSchemas.BulkDeleteCategory
>;

export type CategoryRevenueReport = z.infer<
  typeof apiSchemas.CategoryRevenueReport
>;
export type CategoryWithAllProductsSold = z.infer<
  typeof apiSchemas.CategoryWithAllProductsSold
>;

const baseCategorySchema = z.object({
  category_name: z.string().min(1, "Category name is required"),
});

export const createCategorySchema: z.ZodType<CreateCategoryFormData> =
  baseCategorySchema;

export const updateCategorySchema: z.ZodType<UpdateCategoryFormData> =
  baseCategorySchema;
