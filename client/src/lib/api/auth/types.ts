import { type z } from "zod";

import { type apiSchemas } from "../client";

export type LoginFormData = z.infer<typeof apiSchemas.Body_login>;

export type User = z.infer<typeof apiSchemas.User>;

export type UserID = User["id"];

export type TokenResponse = z.infer<typeof apiSchemas.TokenResponse>;

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
