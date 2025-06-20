import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useApiQuery } from "@/hooks/use-api-query";

import { authApi, authQueryKeys, tokenStorage } from "./service";
import type { LoginFormData } from "./types";

// Hook to listen for token changes and invalidate queries
export const useTokenListener = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = tokenStorage.onChange((token) => {
      if (token) {
        // Token was set - invalidate all queries to refetch with new token
        void queryClient.invalidateQueries();
      } else {
        // Token was removed - clear all queries
        queryClient.clear();
      }
    });

    return unsubscribe;
  }, [queryClient]);
};

export const useGetMe = () => {
  const token = tokenStorage.get();

  return useApiQuery({
    queryKey: authQueryKeys.me(),
    queryFn: () => authApi.getMe(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on auth failures
  });
};

export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: async (response) => {
      // Clear all existing queries to prevent stale data
      queryClient.clear();

      // Store the token - this will trigger the token listener
      tokenStorage.set(response.access_token);

      // Small delay to ensure token is properly set before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to dashboard
      void router.navigate({ to: "/dashboard" });
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Clear token from storage - this will trigger the token listener
      tokenStorage.remove();

      // Redirect to login
      await router.navigate({ to: "/login" });
    },
  });
};

export const useAuth = () => {
  const { data: user, isLoading, error } = useGetMe();
  const token = tokenStorage.get();

  return {
    user: user ?? null,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
  };
};
