import { apiClient } from "@/lib/api/client";

import type { LoginFormData } from "./types";

export const authQueryKeys = {
  all: () => ["auth"] as const,
  me: () => [...authQueryKeys.all(), "me"] as const,
};

export const authApi = {
  async login(data: LoginFormData) {
    return apiClient.login(data);
  },

  async getMe() {
    return apiClient.me();
  },
};

// Token change listeners
type TokenChangeListener = (token: string | null) => void;
const tokenChangeListeners: TokenChangeListener[] = [];

// Token management utilities with reactive updates
export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  set: (token: string): void => {
    localStorage.setItem("auth_token", token);
    // Notify all listeners about token change
    tokenChangeListeners.forEach((listener) => {
      listener(token);
    });
  },

  remove: (): void => {
    localStorage.removeItem("auth_token");
    // Notify all listeners about token removal
    tokenChangeListeners.forEach((listener) => {
      listener(null);
    });
  },

  onChange: (listener: TokenChangeListener): (() => void) => {
    tokenChangeListeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = tokenChangeListeners.indexOf(listener);
      if (index > -1) {
        tokenChangeListeners.splice(index, 1);
      }
    };
  },
};
