import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { AxiosError } from "axios";

import { tokenStorage } from "@/lib/api/auth";

export function useApiQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const router = useRouter();

  const query = useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    throwOnError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        tokenStorage.remove();
        void router.navigate({
          to: "/login",
        });
        return false;
      }
      return true;
    },
    retry: (failureCount, error) => {
      if (options.retry !== undefined) {
        if (typeof options.retry === "boolean") return options.retry;
        if (typeof options.retry === "number")
          return failureCount < options.retry;
        return options.retry(failureCount, error);
      }
      if (error instanceof AxiosError && error.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return query;
}
