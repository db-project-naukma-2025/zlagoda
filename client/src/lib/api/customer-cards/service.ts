import { apiClient } from "@/lib/api/client";

import {
  type BulkDeleteCustomerCardRequest,
  type CreateCustomerCardFormData,
  type CustomerCardNumber,
  type GetCardSoldCategoriesReportOptions,
  type GetCustomerCardsOptions,
  type UpdateCustomerCardFormData,
} from "./types";

export const customerCardQueryKeys = {
  all: () => ["customer-cards"] as const,
  list: (params?: Partial<GetCustomerCardsOptions>) =>
    [...customerCardQueryKeys.all(), "list", params] as const,
  detail: (id: CustomerCardNumber) =>
    [...customerCardQueryKeys.all(), "detail", id] as const,
  report: (params?: Partial<GetCardSoldCategoriesReportOptions>) =>
    [...customerCardQueryKeys.all(), "report", params] as const,
};

export const customerCardsApi = {
  async getCustomerCards(params?: Partial<GetCustomerCardsOptions>) {
    return apiClient.getCustomerCards({
      queries: params ?? {},
    });
  },

  async getCustomerCard(cardNumber: CustomerCardNumber) {
    return apiClient.getCustomerCard({
      params: { card_number: cardNumber },
    });
  },

  async createCustomerCard(data: CreateCustomerCardFormData) {
    return apiClient.createCustomerCard(data);
  },

  async updateCustomerCard(
    cardNumber: CustomerCardNumber,
    data: UpdateCustomerCardFormData,
  ) {
    return apiClient.updateCustomerCard(data, {
      params: { card_number: cardNumber },
    });
  },

  async deleteCustomerCard(cardNumber: CustomerCardNumber) {
    return apiClient.deleteCustomerCard(undefined, {
      params: { card_number: cardNumber },
    });
  },

  async bulkDeleteCustomerCards(request: BulkDeleteCustomerCardRequest) {
    return apiClient.bulkDeleteCustomerCards(request);
  },

  async getCardSoldCategoriesReport(
    params?: Partial<GetCardSoldCategoriesReportOptions>,
  ) {
    return apiClient.getCardSoldCategoriesReport({
      queries: params ?? {},
    });
  },
};
