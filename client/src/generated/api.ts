import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const limit = z.union([z.number(), z.null()]).optional().default(10);
const search = z.union([z.string(), z.null()]).optional();
const Category = z
  .object({ category_number: z.number().int(), category_name: z.string() })
  .passthrough();
const PaginatedResponse_Category_ = z
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
const BulkDeleteCategory = z
  .object({ ids: z.array(z.number().int()) })
  .passthrough();
const CategoryRevenueReport = z
  .object({
    category_number: z.number().int(),
    category_name: z.string(),
    total_amount: z.number().int(),
    total_revenue: z.number(),
  })
  .passthrough();
const CategoryWithAllProductsSold = z
  .object({ category_number: z.number().int(), category_name: z.string() })
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
const PaginatedResponse_CustomerCard_ = z
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
const percent = z.union([z.number(), z.null()]).optional();
const sort_by = z
  .union([
    z.enum([
      "cust_surname",
      "percent",
      "card_number",
      "cust_name",
      "cust_patronymic",
      "phone_number",
      "city",
      "street",
      "zip_code",
    ]),
    z.null(),
  ])
  .optional()
  .default("card_number");
const sort_order = z
  .union([z.enum(["asc", "desc"]), z.null()])
  .optional()
  .default("asc");
const CardSoldCategoriesReport = z
  .object({
    card_number: z.string(),
    customer_name: z.string(),
    category_name: z.string(),
    total_products: z.number().int(),
    total_revenue: z.number(),
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
const BulkDeleteCustomerCard = z
  .object({ ids: z.array(z.string()) })
  .passthrough();
const Product = z
  .object({
    category_number: z.number().int(),
    product_name: z.string(),
    characteristics: z.string(),
    id_product: z.number().int(),
  })
  .passthrough();
const PaginatedResponse_Product_ = z
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
const BulkDeleteProduct = z
  .object({ ids: z.array(z.number().int()) })
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
const PaginatedResponse_StoreProduct_ = z
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
    units: z.number().int().gte(1),
    operation_type: z.enum(["convert", "add"]).optional().default("convert"),
  })
  .passthrough();
const BulkDeleteStoreProduct = z
  .object({ ids: z.array(z.string()) })
  .passthrough();
const CreateSale = z
  .object({
    UPC: z.string().min(12).max(12),
    product_number: z.number().int().gt(0),
  })
  .passthrough();
const CreateCheck = z
  .object({
    check_number: z.string().min(10).max(10),
    id_employee: z.string().min(10).max(10),
    card_number: z.union([z.string(), z.null()]),
    print_date: z.string().datetime({ offset: true }),
    sales: z.array(CreateSale),
  })
  .passthrough();
const Sale = z
  .object({
    UPC: z.string().min(12).max(12),
    product_number: z.number().int().gt(0),
    selling_price: z.number().gt(0),
    check_number: z.string().min(10).max(10),
  })
  .passthrough();
const Check = z
  .object({
    check_number: z.string().min(10).max(10),
    id_employee: z.string().min(10).max(10),
    card_number: z.union([z.string(), z.null()]),
    print_date: z.string().datetime({ offset: true }),
    sum_total: z.number().gte(0),
    vat: z.number().gte(0),
    sales: z.array(Sale),
  })
  .passthrough();
const sort_by__2 = z
  .union([z.enum(["check_number", "print_date", "sum_total"]), z.null()])
  .optional();
const sort_order__2 = z.union([z.enum(["asc", "desc"]), z.null()]).optional();
const ChecksMetadata = z
  .object({
    total_sum: z.number(),
    total_vat: z.number(),
    total_items_count: z.number().int(),
    total_product_types: z.number().int(),
    checks_count: z.number().int(),
  })
  .passthrough();
const PaginatedChecks = z
  .object({
    data: z.array(Check),
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    metadata: ChecksMetadata,
  })
  .passthrough();
const Employee = z
  .object({
    empl_surname: z.string().max(50),
    empl_name: z.string().max(50),
    empl_patronymic: z.union([z.string(), z.null()]),
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
const PaginatedResponse_Employee_ = z
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
    empl_patronymic: z.union([z.string(), z.null()]),
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
    empl_patronymic: z.union([z.string(), z.null()]),
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
const BulkDeleteEmployee = z.object({ ids: z.array(z.string()) }).passthrough();
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
const ErrorResponse = z.object({ detail: z.string() }).passthrough();
const UserWithScopes = z
  .object({
    username: z.string(),
    password: z.union([z.string(), z.string()]),
    is_superuser: z.boolean().optional().default(false),
    id_employee: z.union([z.string(), z.null()]).optional(),
    id: z.number().int(),
    scopes: z.array(z.string()),
    groups: z.array(z.string()),
  })
  .passthrough();

export const schemas = {
  limit,
  search,
  Category,
  PaginatedResponse_Category_,
  ValidationError,
  HTTPValidationError,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BulkDeleteCategory,
  CategoryRevenueReport,
  CategoryWithAllProductsSold,
  CustomerCard,
  PaginatedResponse_CustomerCard_,
  CustomerCardCreate,
  percent,
  sort_by,
  sort_order,
  CardSoldCategoriesReport,
  CustomerCardUpdate,
  BulkDeleteCustomerCard,
  Product,
  PaginatedResponse_Product_,
  CreateProduct,
  UpdateProduct,
  BulkDeleteProduct,
  promotional_only,
  StoreProduct,
  PaginatedResponse_StoreProduct_,
  CreateStoreProduct,
  UpdateStoreProduct,
  CreatePromotionalProduct,
  BulkDeleteStoreProduct,
  CreateSale,
  CreateCheck,
  Sale,
  Check,
  sort_by__2,
  sort_order__2,
  ChecksMetadata,
  PaginatedChecks,
  Employee,
  PaginatedResponse_Employee_,
  CreateEmployee,
  UpdateEmployee,
  BulkDeleteEmployee,
  Body_login,
  TokenResponse,
  ErrorResponse,
  UserWithScopes,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/auth/me",
    alias: "me",
    requestFormat: "json",
    response: UserWithScopes,
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
        status: 401,
        description: `Invalid credentials`,
        schema: z.object({ detail: z.string() }).passthrough(),
      },
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
        schema: limit,
      },
      {
        name: "search",
        type: "Query",
        schema: search,
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
    response: PaginatedResponse_Category_,
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
        schema: BulkDeleteCategory,
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
    path: "/categories/reports/all-products-sold",
    alias: "getCategoriesWithAllProductsSold",
    requestFormat: "json",
    response: z.array(CategoryWithAllProductsSold),
  },
  {
    method: "get",
    path: "/categories/reports/revenue",
    alias: "getCategoryRevenueReport",
    requestFormat: "json",
    parameters: [
      {
        name: "date_from",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "date_to",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(CategoryRevenueReport),
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
    path: "/checks/",
    alias: "CheckViewSet_create_check_checks__post",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CreateCheck,
      },
    ],
    response: Check,
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
    path: "/checks/",
    alias: "CheckViewSet_get_checks_checks__get",
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
        schema: percent,
      },
      {
        name: "date_from",
        type: "Query",
        schema: search,
      },
      {
        name: "date_to",
        type: "Query",
        schema: search,
      },
      {
        name: "employee_id",
        type: "Query",
        schema: search,
      },
      {
        name: "product_upc",
        type: "Query",
        schema: search,
      },
      {
        name: "sort_by",
        type: "Query",
        schema: sort_by__2,
      },
      {
        name: "sort_order",
        type: "Query",
        schema: sort_order__2,
      },
    ],
    response: PaginatedChecks,
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
    path: "/checks/:check_number",
    alias: "CheckViewSet_get_check_checks__check_number__get",
    requestFormat: "json",
    parameters: [
      {
        name: "check_number",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Check,
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
        schema: limit,
      },
    ],
    response: PaginatedResponse_CustomerCard_,
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
        schema: BulkDeleteCustomerCard,
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
    path: "/customer-cards/reports/card-sold-categories",
    alias: "getCardSoldCategoriesReport",
    requestFormat: "json",
    parameters: [
      {
        name: "card_number",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "category_name",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "start_date",
        type: "Query",
        schema: z.string().optional(),
      },
      {
        name: "end_date",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: z.array(CardSoldCategoriesReport),
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
    path: "/customer-cards/search",
    alias: "searchCustomerCards",
    requestFormat: "json",
    parameters: [
      {
        name: "cust_surname",
        type: "Query",
        schema: search,
      },
      {
        name: "percent",
        type: "Query",
        schema: percent,
      },
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
        name: "sort_by",
        type: "Query",
        schema: sort_by,
      },
      {
        name: "sort_order",
        type: "Query",
        schema: sort_order,
      },
    ],
    response: PaginatedResponse_CustomerCard_,
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
        schema: limit,
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
          .enum([
            "empl_surname",
            "empl_role",
            "id_employee",
            "salary",
            "date_of_birth",
            "date_of_start",
          ])
          .optional()
          .default("empl_surname"),
      },
      {
        name: "sort_order",
        type: "Query",
        schema: z.enum(["asc", "desc"]).optional().default("asc"),
      },
    ],
    response: PaginatedResponse_Employee_,
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
        schema: BulkDeleteEmployee,
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
    path: "/employees/reports/only-with-promotional-sales",
    alias: "getEmployeesOnlyWithPromotionalSales",
    requestFormat: "json",
    response: z.array(Employee),
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
        schema: limit,
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
        schema: percent,
      },
    ],
    response: PaginatedResponse_Product_,
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
        schema: BulkDeleteProduct,
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
        schema: limit,
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
        schema: percent,
      },
    ],
    response: PaginatedResponse_StoreProduct_,
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
        schema: BulkDeleteStoreProduct,
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
