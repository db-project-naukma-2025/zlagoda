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
export type BulkDeleteRequest = z.infer<
  typeof apiSchemas.app__views__category__BulkDeleteRequest
>;

export const createCategorySchema: z.ZodType<CreateCategoryFormData> = z.object(
  {
    category_name: z.string().min(1, "Category name is required"),
  },
);

export const updateCategorySchema: z.ZodType<UpdateCategoryFormData> = z.object(
  {
    category_name: z.string().min(1, "Category name is required"),
  },
);
