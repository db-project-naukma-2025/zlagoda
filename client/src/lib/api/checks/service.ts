import { apiClient } from "@/lib/api/client";

import {
  type CheckNumber,
  type CreateCheck,
  type GetChecksOptions,
} from "./types";

export const checkQueryKeys = {
  all: () => ["checks"] as const,
  list: (params?: Partial<GetChecksOptions>) =>
    [...checkQueryKeys.all(), "list", params] as const,
  detail: (checkNumber: CheckNumber) =>
    [...checkQueryKeys.all(), "detail", checkNumber] as const,
};

export const checksApi = {
  async getChecks(params?: Partial<GetChecksOptions>) {
    return apiClient.CheckViewSet_get_checks_checks__get({
      queries: params ?? {},
    });
  },

  async getCheck(checkNumber: CheckNumber) {
    return apiClient.CheckViewSet_get_check_checks__check_number__get({
      params: { check_number: checkNumber },
    });
  },

  async createCheck(data: CreateCheck) {
    return apiClient.CheckViewSet_create_check_checks__post(data);
  },
};
