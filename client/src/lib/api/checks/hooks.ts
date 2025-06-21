import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useApiQuery } from "@/hooks/use-api-query";

import { checkQueryKeys, checksApi } from "./service";
import {
  type CheckNumber,
  type CreateCheck,
  type GetChecksOptions,
} from "./types";

export const useGetChecks = (params?: Partial<GetChecksOptions>) => {
  return useApiQuery({
    queryKey: checkQueryKeys.list(params),
    queryFn: () => checksApi.getChecks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetCheck = (checkNumber: CheckNumber) => {
  return useApiQuery({
    queryKey: checkQueryKeys.detail(checkNumber),
    queryFn: () => checksApi.getCheck(checkNumber),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateCheck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCheck) => checksApi.createCheck(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: checkQueryKeys.all(),
      });
    },
  });
};
