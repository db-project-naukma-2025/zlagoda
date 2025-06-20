import { type ApiOf } from "@zodios/core";

import {
  createApiClient,
  schemas as generatedSchemas,
  type api,
} from "@/generated/api";

export type Api = ApiOf<typeof api>;
export const apiSchemas = generatedSchemas;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create API client with interceptors
const baseApiClient = createApiClient(API_BASE_URL);

// Add request interceptor to include auth token
baseApiClient.use({
  name: "auth-interceptor",
  request: (_, config) => {
    const token = localStorage.getItem("auth_token");

    let newConfig = config;

    if (token) {
      newConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      };
    }
    return Promise.resolve(newConfig);
  },
});

export const apiClient = baseApiClient;
