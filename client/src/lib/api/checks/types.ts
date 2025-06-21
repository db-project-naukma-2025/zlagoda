import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type Check = z.infer<typeof apiSchemas.Check>;
export type CreateCheck = z.infer<typeof apiSchemas.CreateCheck>;
export type CreateSale = z.infer<typeof apiSchemas.CreateSale>;
export type Sale = z.infer<typeof apiSchemas.Sale>;
export type ChecksMetadata = z.infer<typeof apiSchemas.ChecksMetadata>;

export type CheckNumber = string;

type GetChecksQueryParams = Extract<
  Api[number],
  { path: "/checks/"; method: "get" }
>["parameters"];

export type GetChecksOptions = {
  [K in GetChecksQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

const checkNumberSchema = z
  .string()
  .min(10, "Check number must be 10 characters")
  .max(10, "Check number must be 10 characters");

const saleSchema = z.object({
  UPC: z
    .string()
    .min(12, "UPC must be 12 characters")
    .max(12, "UPC must be 12 characters"),
  product_number: z
    .number()
    .int()
    .min(1, "Product number must be greater than 0"),
});

export const createCheckSchema: z.ZodType<CreateCheck> = z.object({
  check_number: checkNumberSchema,
  id_employee: z
    .string()
    .min(10, "Employee ID must be 10 characters")
    .max(10, "Employee ID must be 10 characters"),
  card_number: z.string().nullable(),
  print_date: z.string().datetime({ offset: true }),
  sales: z.array(saleSchema).min(1, "At least one sale is required"),
});
