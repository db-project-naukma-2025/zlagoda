import { type z } from "zod";

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
