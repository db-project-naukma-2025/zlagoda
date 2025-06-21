import { z } from "zod";

import { type Api, type apiSchemas } from "../client";

export type Employee = z.infer<typeof apiSchemas.Employee>;
export type CreateEmployeeFormData = z.infer<typeof apiSchemas.CreateEmployee>;
export type UpdateEmployeeFormData = z.infer<typeof apiSchemas.UpdateEmployee>;

export type EmployeeId = string;

export type BulkDeleteEmployeeRequest = z.infer<
  typeof apiSchemas.BulkDeleteEmployee
>;

export type EmployeeWorkStatistics = z.infer<
  typeof apiSchemas.EmployeeWorkStatistics
>;
export type EmployeeSelfInfo = z.infer<typeof apiSchemas.EmployeeSelfInfo>;

type GetEmployeesQueryParams = Extract<
  Api[number],
  { path: "/employees/"; method: "get" }
>["parameters"];

export type GetEmployeesOptions = {
  [K in GetEmployeesQueryParams[number] as K["name"]]: z.infer<K["schema"]>;
};

const employeeIdSchema = z
  .string()
  .min(10, "Employee ID must be 10 characters")
  .max(10, "Employee ID must be 10 characters");

const phoneNumberSchema = z
  .string()
  .min(13, "Phone number must be 13 characters")
  .max(13, "Phone number must be 13 characters");

const zipCodeSchema = z
  .string()
  .min(5, "ZIP code must be at least 5 characters")
  .max(9, "ZIP code must be at most 9 characters");

const baseEmployeeSchema = z.object({
  empl_surname: z.string().max(50, "Surname must be at most 50 characters"),
  empl_name: z.string().max(50, "Name must be at most 50 characters"),
  empl_patronymic: z
    .string()
    .max(50, "Patronymic must be at most 50 characters")
    .nullable(),
  empl_role: z.enum(["cashier", "manager"], {
    errorMap: () => ({ message: "Role must be either cashier or manager" }),
  }),
  salary: z.number().min(0, "Salary must be non-negative"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  date_of_start: z.string().min(1, "Date of start is required"),
  phone_number: phoneNumberSchema,
  city: z.string().max(50, "City must be at most 50 characters"),
  street: z.string().max(50, "Street must be at most 50 characters"),
  zip_code: zipCodeSchema,
});

export const createEmployeeSchema: z.ZodType<CreateEmployeeFormData> =
  baseEmployeeSchema.extend({
    id_employee: employeeIdSchema,
  });

export const updateEmployeeSchema: z.ZodType<UpdateEmployeeFormData> =
  baseEmployeeSchema;
