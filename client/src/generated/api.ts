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
    cust_surname: z.string().min(1).max(50),
    cust_name: z.string().min(1).max(50),
    cust_patronymic: z.union([z.string(), z.null()]),
    phone_number: z.string().min(1).max(13),
    city: z.union([z.string(), z.null()]),
    street: z.union([z.string(), z.null()]),
    zip_code: z.union([z.string(), z.null()]),
    percent: z.number().int(),
  })
  .partial()
  .passthrough();
const BulkDeleteCustomerCardRequest = z
  .object({ card_numbers: z.array(z.string()) })
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
const search = z.union([z.string(), z.null()]).optional();
const Employee = z
  .object({
    empl_surname: z.string().max(50),
    empl_name: z.string().max(50),
    empl_patronymic: z.union([z.string(), z.null()]).optional(),
    empl_role: z.enum(["cashier", "manager"]),
    salary: z.number().gte(0),
    date_of_birth: z.string(),
    date_of_start: z.string(),
    phone_number: z.string().min(13).max(13),
    city: z.string().max(50),
    street: z.string().max(50),
    zip_code: z.string().min(5).max(9),
    id_employee: z.string().min(10).max(10),
  })
  .passthrough();
const PaginatedEmployees = z
  .object({
    data: z.array(Employee),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .passthrough();
const CreateEmployee = z
  .object({
    empl_surname: z.string().max(50),
    empl_name: z.string().max(50),
    empl_patronymic: z.union([z.string(), z.null()]).optional(),
    empl_role: z.enum(["cashier", "manager"]),
    salary: z.number().gte(0),
    date_of_birth: z.string(),
    date_of_start: z.string(),
    phone_number: z.string().min(13).max(13),
    city: z.string().max(50),
    street: z.string().max(50),
    zip_code: z.string().min(5).max(9),
    id_employee: z.string().min(10).max(10),
  })
  .passthrough();
const UpdateEmployee = z
  .object({
    empl_surname: z.string().max(50),
    empl_name: z.string().max(50),
    empl_patronymic: z.union([z.string(), z.null()]).optional(),
    empl_role: z.enum(["cashier", "manager"]),
    salary: z.number().gte(0),
    date_of_birth: z.string(),
    date_of_start: z.string(),
    phone_number: z.string().min(13).max(13),
    city: z.string().max(50),
    street: z.string().max(50),
    zip_code: z.string().min(5).max(9),
  })
  .passthrough();
const app__views__employee__BulkDeleteRequest = z
  .object({ employee_ids: z.array(z.string()) })
  .passthrough();
const Body_login = z
  .object({
    grant_type: z.union([z.string(), z.null()]).optional(),
    username: z.string(),
    password: z.string(),
    scope: z.string().optional().default(""),
    client_id: z.union([z.string(), z.null()]).optional(),
    client_secret: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();
const TokenResponse = z
  .object({ access_token: z.string(), token_type: z.string() })
  .passthrough();
const User = z
  .object({
    id: z.number().int(),
    username: z.string(),
    password: z.string(),
    is_superuser: z.boolean().optional().default(false),
  })
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
  search,
  Employee,
  PaginatedEmployees,
  CreateEmployee,
  UpdateEmployee,
  app__views__employee__BulkDeleteRequest,
  Body_login,
  TokenResponse,
  User,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/auth/me",
    alias: "me",
    requestFormat: "json",
    response: User,
  },
  {
    method: "post",
    path: "/auth/token",
    alias: "login",
    requestFormat: "form-url",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Body_login,
      },
    ],
    response: TokenResponse,
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
  {
    method: "get",
    path: "/employees/",
    alias: "getEmployees",
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
        schema: search,
      },
      {
        name: "role_filter",
        type: "Query",
        schema: search,
      },
      {
        name: "sort_by",
        type: "Query",
        schema: z
          .enum(["empl_surname", "empl_role"])
          .optional()
          .default("empl_surname"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
    ],
    response: PaginatedEmployees,
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
    path: "/employees/",
    alias: "createEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateEmployee,
      },
    ],
    response: Employee,
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
    path: "/employees/:id_employee",
    alias: "getEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "id_employee",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Employee,
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
    path: "/employees/:id_employee",
    alias: "updateEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: UpdateEmployee,
      },
      {
        name: "id_employee",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Employee,
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
    path: "/employees/:id_employee",
    alias: "deleteEmployee",
    requestFormat: "json",
    parameters: [
      {
        name: "id_employee",
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
    path: "/employees/bulk-delete",
    alias: "bulkDeleteEmployees",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: app__views__employee__BulkDeleteRequest,
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
