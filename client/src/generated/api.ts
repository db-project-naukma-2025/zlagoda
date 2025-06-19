import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Category = z
  .object({ category_number: z.number().int(), category_name: z.string() })
  .passthrough();
const PaginatedCategories = z
  .object({
    data: z.array(Category),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const ValidationError = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })
  .passthrough();
const HTTPValidationError = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .passthrough();
const CreateCategoryRequest = z
  .object({ category_name: z.string() })
  .passthrough();
const UpdateCategoryRequest = z
  .object({ category_name: z.string() })
  .passthrough();
const BulkDeleteCategoryRequest = z
  .object({ category_numbers: z.array(z.number().int()) })
  .passthrough();
const CustomerCard = z
  .object({
    card_number: z.string().min(1).max(13),
    cust_surname: z.string().min(1).max(50),
    cust_name: z.string().min(1).max(50),
    cust_patronymic: z.union([z.string(), z.null()]),
    phone_number: z
      .string()
      .min(1)
      .max(13)
      .regex(/^\+\d{12}$/),
    city: z.union([z.string(), z.null()]),
    street: z.union([z.string(), z.null()]),
    zip_code: z.union([z.string(), z.null()]),
    percent: z.number().int().gte(0).lte(100),
  })
  .passthrough();
const PaginatedCustomerCards = z
  .object({
    data: z.array(CustomerCard),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const CustomerCardCreate = z
  .object({
    card_number: z.string().min(1).max(13),
    cust_surname: z.string().min(1).max(50),
    cust_name: z.string().min(1).max(50),
    cust_patronymic: z.union([z.string(), z.null()]),
    phone_number: z
      .string()
      .min(1)
      .max(13)
      .regex(/^\+\d{12}$/),
    city: z.union([z.string(), z.null()]),
    street: z.union([z.string(), z.null()]),
    zip_code: z.union([z.string(), z.null()]),
    percent: z.number().int().gte(0).lte(100),
  })
  .passthrough();
const CustomerCardUpdate = z
  .object({
    cust_surname: z.union([z.string(), z.unknown()]),
    cust_name: z.union([z.string(), z.unknown()]),
    cust_patronymic: z.union([z.union([z.string(), z.unknown()]), z.null()]),
    phone_number: z.union([z.string(), z.unknown()]),
    city: z.union([z.union([z.string(), z.unknown()]), z.null()]),
    street: z.union([z.union([z.string(), z.unknown()]), z.null()]),
    zip_code: z.union([z.union([z.string(), z.unknown()]), z.null()]),
    percent: z.union([z.number(), z.unknown()]),
  })
  .partial()
  .passthrough();
const BulkDeleteCustomerCardRequest = z
  .object({ card_numbers: z.array(z.string()) })
  .passthrough();

export const schemas = {
  Category,
  PaginatedCategories,
  ValidationError,
  HTTPValidationError,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkDeleteCategoryRequest,
  CustomerCard,
  PaginatedCustomerCards,
  CustomerCardCreate,
  CustomerCardUpdate,
  BulkDeleteCustomerCardRequest,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/categories/",
    alias: "getCategories",
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(1000).optional().default(10),
      },
      {
        name: "search",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "sort_by",
        type: "Query",
        schema: z
          .enum(["category_number", "category_name"])
          .optional()
          .default("category_number"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
    ],
    response: PaginatedCategories,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/categories/",
    alias: "createCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ category_name: z.string() }).passthrough(),
      },
    ],
    response: Category,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/categories/:category_number",
    alias: "getCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "category_number",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/categories/:category_number",
    alias: "updateCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ category_name: z.string() }).passthrough(),
      },
      {
        name: "category_number",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Category,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/categories/:category_number",
    alias: "deleteCategory",
    requestFormat: "json",
    parameters: [
      {
        name: "category_number",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/categories/bulk-delete",
    alias: "bulkDeleteCategories",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BulkDeleteCategoryRequest,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/customer-cards/",
    alias: "getCustomerCards",
    requestFormat: "json",
    parameters: [
      {
        name: "skip",
        type: "Query",
        schema: z.number().int().gte(0).optional().default(0),
      },
      {
        name: "limit",
        type: "Query",
        schema: z.number().int().gte(1).lte(1000).optional().default(10),
      },
    ],
    response: PaginatedCustomerCards,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/customer-cards/",
    alias: "createCustomerCard",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerCardCreate,
      },
    ],
    response: CustomerCard,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "get",
    path: "/customer-cards/:card_number",
    alias: "getCustomerCard",
    requestFormat: "json",
    parameters: [
      {
        name: "card_number",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CustomerCard,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "put",
    path: "/customer-cards/:card_number",
    alias: "updateCustomerCard",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CustomerCardUpdate,
      },
      {
        name: "card_number",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: CustomerCard,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "delete",
    path: "/customer-cards/:card_number",
    alias: "deleteCustomerCard",
    requestFormat: "json",
    parameters: [
      {
        name: "card_number",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
  {
    method: "post",
    path: "/customer-cards/bulk-delete",
    alias: "bulkDeleteCustomerCards",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BulkDeleteCustomerCardRequest,
      },
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError,
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
