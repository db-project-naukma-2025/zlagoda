import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type CustomerCard = z.infer<typeof apiSchemas.CustomerCard>;
export type CustomerCardNumber = CustomerCard["card_number"];

type GetCustomerCardsQueryParams = Extract<
  Api[number],
  { path: "/customer-cards/"; method: "get" }
>["parameters"];

export type GetCustomerCardsOptions = {
  [K in GetCustomerCardsQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

export type CreateCustomerCardFormData = z.infer<
  typeof apiSchemas.CustomerCardCreate
>;

export type UpdateCustomerCardFormData = z.infer<
  typeof apiSchemas.CustomerCardUpdate
>;

export type BulkDeleteCustomerCardRequest = z.infer<
  typeof apiSchemas.BulkDeleteCustomerCardRequest
>;

export const baseCustomerCardSchema = z.object({
  cust_surname: z
    .string()
    .min(1, "Customer surname is required")
    .max(50, "Customer surname must be less than 50 characters"),
  cust_name: z
    .string()
    .min(1, "Customer name is required")
    .max(50, "Customer name must be less than 50 characters"),
  cust_patronymic: z
    .string()
    .max(50, "Customer patronymic must be less than 50 characters")
    .nullable()
    .or(z.string().max(0)),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+\d{12}$/, "Phone number must be in the format +XXXXXXXXXXXX"),
  city: z
    .string()
    .max(50, "City must be less than 50 characters")
    .nullable()
    .or(z.string().max(0)),
  street: z
    .string()
    .max(50, "Street must be less than 50 characters")
    .nullable()
    .or(z.string().max(0)),
  zip_code: z
    .string()
    .max(50, "Zip code must be less than 50 characters")
    .nullable()
    .or(z.string().max(0)),
  percent: z
    .number()
    .min(0, "Percent must be greater than or equal to 0")
    .max(100, "Percent must be less than or equal to 100"),
});

export const updateCustomerCardSchema: z.ZodType<UpdateCustomerCardFormData> =
  baseCustomerCardSchema;

export const createCustomerCardSchema: z.ZodType<CreateCustomerCardFormData> =
  baseCustomerCardSchema.extend({
    card_number: z
      .string()
      .min(1, "Card number is required")
      .max(13, "Card number must be 13 digits"),
  });

export type CardSoldCategoriesReport = z.infer<
  typeof apiSchemas.CardSoldCategoriesReport
>;

type GetCardSoldCategoriesReportQueryParams = Extract<
  Api[number],
  { path: "/customer-cards/reports/card-sold-categories"; method: "get" }
>["parameters"];

export type GetCardSoldCategoriesReportOptions = {
  [K in GetCardSoldCategoriesReportQueryParams[number] as K["name"]]: z.infer<
    K["schema"]
  >;
};
