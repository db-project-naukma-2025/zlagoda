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
const app__views__category__BulkDeleteRequest = z
  .object({ category_numbers: z.array(z.number().int()) })
  .passthrough();
const category_number = z.union([z.number(), z.null()]).optional();
const Product = z
  .object({
    category_number: z.number().int(),
    product_name: z.string(),
    characteristics: z.string(),
    id_product: z.number().int(),
  })
  .passthrough();
const PaginatedProducts = z
  .object({
    data: z.array(Product),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const CreateProduct = z
  .object({
    category_number: z.number().int(),
    product_name: z.string(),
    characteristics: z.string(),
  })
  .passthrough();
const UpdateProduct = z
  .object({
    category_number: z.number().int(),
    product_name: z.string(),
    characteristics: z.string(),
    id_product: z.number().int(),
  })
  .passthrough();
const app__views__product__BulkDeleteRequest = z
  .object({ product_ids: z.array(z.number().int()) })
  .passthrough();
const promotional_only = z.union([z.boolean(), z.null()]).optional();
const StoreProduct = z
  .object({
    UPC_prom: z.union([z.string(), z.null()]),
    id_product: z.number().int(),
    selling_price: z.number().gte(0),
    products_number: z.number().int().gte(0),
    promotional_product: z.boolean(),
    UPC: z.string().min(12).max(12),
  })
  .passthrough();
const PaginatedStoreProducts = z
  .object({
    data: z.array(StoreProduct),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const CreateStoreProduct = z
  .object({
    UPC_prom: z.union([z.string(), z.null()]),
    id_product: z.number().int(),
    selling_price: z.number().gte(0),
    products_number: z.number().int().gte(0),
    promotional_product: z.boolean(),
    UPC: z.string().min(12).max(12),
  })
  .passthrough();
const UpdateStoreProduct = z
  .object({
    UPC_prom: z.union([z.string(), z.null()]),
    id_product: z.number().int(),
    selling_price: z.number().gte(0),
    products_number: z.number().int().gte(0),
    promotional_product: z.boolean(),
  })
  .passthrough();
const CreatePromotionalProduct = z
  .object({
    promotional_UPC: z.string().min(12).max(12),
    units_to_convert: z.number().int().gte(1),
  })
  .passthrough();
const app__views__store_product__BulkDeleteRequest = z
  .object({ upcs: z.array(z.string()) })
  .passthrough();

export const schemas = {
  Category,
  PaginatedCategories,
  ValidationError,
  HTTPValidationError,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  app__views__category__BulkDeleteRequest,
  category_number,
  Product,
  PaginatedProducts,
  CreateProduct,
  UpdateProduct,
  app__views__product__BulkDeleteRequest,
  promotional_only,
  StoreProduct,
  PaginatedStoreProducts,
  CreateStoreProduct,
  UpdateStoreProduct,
  CreatePromotionalProduct,
  app__views__store_product__BulkDeleteRequest,
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
        schema: app__views__category__BulkDeleteRequest,
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
    path: "/products/",
    alias: "getProducts",
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
          .enum(["id_product", "product_name", "category_number"])
          .optional()
          .default("id_product"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
      {
        name: "category_number",
        type: "Query",
        schema: category_number,
      },
    ],
    response: PaginatedProducts,
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
    path: "/products/",
    alias: "createProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateProduct,
      },
    ],
    response: Product,
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
    path: "/products/:id_product",
    alias: "getProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "id_product",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
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
    path: "/products/:id_product",
    alias: "updateProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateProduct,
      },
      {
        name: "id_product",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: Product,
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
    path: "/products/:id_product",
    alias: "deleteProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "id_product",
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
    path: "/products/bulk-delete",
    alias: "bulkDeleteProducts",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: app__views__product__BulkDeleteRequest,
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
    path: "/store-products/",
    alias: "getStoreProducts",
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
          .enum([
            "UPC",
            "selling_price",
            "products_number",
            "promotional_product",
            "UPC_prom",
          ])
          .optional()
          .default("UPC"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
      {
        name: "promotional_only",
        type: "Query",
        schema: promotional_only,
      },
      {
        name: "id_product",
        type: "Query",
        schema: category_number,
      },
    ],
    response: PaginatedStoreProducts,
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
    path: "/store-products/",
    alias: "createStoreProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateStoreProduct,
      },
    ],
    response: StoreProduct,
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
    path: "/store-products/:source_upc/create-promotional",
    alias: "createPromotionalProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreatePromotionalProduct,
      },
      {
        name: "source_upc",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: StoreProduct,
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
    path: "/store-products/:upc",
    alias: "getStoreProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "upc",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: StoreProduct,
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
    path: "/store-products/:upc",
    alias: "updateStoreProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateStoreProduct,
      },
      {
        name: "upc",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: StoreProduct,
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
    path: "/store-products/:upc",
    alias: "deleteStoreProduct",
    requestFormat: "json",
    parameters: [
      {
        name: "upc",
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
    path: "/store-products/bulk-delete",
    alias: "bulkDeleteStoreProducts",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: app__views__store_product__BulkDeleteRequest,
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
