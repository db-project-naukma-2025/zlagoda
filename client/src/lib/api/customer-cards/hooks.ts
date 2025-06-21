import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";

import { customerCardQueryKeys, customerCardsApi } from "./service";
import {
  type BulkDeleteCustomerCardRequest,
  type CreateCustomerCardFormData,
  type CustomerCardNumber,
  type GetCardSoldCategoriesReportOptions,
  type GetCustomerCardsOptions,
  type SearchCustomerCardsOptions,
  type UpdateCustomerCardFormData,
} from "./types";

export const useGetCustomerCards = (
  params?: Partial<GetCustomerCardsOptions>,
) => {
  return useApiQuery({
    queryKey: customerCardQueryKeys.list(params),
    queryFn: () => customerCardsApi.getCustomerCards(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetCustomerCard = (customerCardNumber: CustomerCardNumber) => {
  return useApiQuery({
    queryKey: customerCardQueryKeys.detail(customerCardNumber),
    queryFn: () => customerCardsApi.getCustomerCard(customerCardNumber),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCustomerCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerCardFormData) =>
      customerCardsApi.createCustomerCard(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerCardQueryKeys.all(),
      });
    },
  });
};

export const useUpdateCustomerCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: CustomerCardNumber;
      data: UpdateCustomerCardFormData;
    }) => customerCardsApi.updateCustomerCard(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerCardQueryKeys.all(),
      });
    },
  });
};

export const useDeleteCustomerCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (number: CustomerCardNumber) =>
      customerCardsApi.deleteCustomerCard(number),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerCardQueryKeys.all(),
      });
    },
  });
};

export const useBulkDeleteCustomerCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkDeleteCustomerCardRequest) =>
      customerCardsApi.bulkDeleteCustomerCards(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerCardQueryKeys.all(),
      });
    },
  });
};

export const useGetCardSoldCategoriesReport = (
  params: Partial<GetCardSoldCategoriesReportOptions>,
) => {
  return useApiQuery({
    queryKey: customerCardQueryKeys.report(params),
    queryFn: () => customerCardsApi.getCardSoldCategoriesReport(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchCustomerCards = (
  params?: Partial<SearchCustomerCardsOptions>,
) => {
  return useApiQuery({
    queryKey: customerCardQueryKeys.search(params),
    queryFn: () => customerCardsApi.searchCustomerCards(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
