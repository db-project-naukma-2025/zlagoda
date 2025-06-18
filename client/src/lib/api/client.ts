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
  response: (_, __, response) => {
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Clear token from storage
      localStorage.removeItem("auth_token");

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.resolve(response);
  },
});

export const apiClient = baseApiClient;
