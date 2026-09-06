import type { AuthTokens, AuthUser } from "@car-garage/shared";
import { STORAGE_KEYS } from "../../core/config";

export const AUTH_FEATURE_KEY = "auth";

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  loading: boolean;
  error: string | null;
}

/** Read a persisted session so a page reload stays logged in. */
function readPersistedSession(): Pick<AuthState, "user" | "tokens"> {
  try {
    const accessToken = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.accessToken) ?? "null",
    ) as string | null;
    const refreshToken = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.refreshToken) ?? "null",
    ) as string | null;
    const user = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.user) ?? "null",
    ) as AuthUser | null;
    if (accessToken && refreshToken) {
      return { user, tokens: { accessToken, refreshToken, expiresIn: 0 } };
    }
  } catch {
    /* ignore */
  }
  return { user: null, tokens: null };
}

export const initialAuthState: AuthState = {
  ...readPersistedSession(),
  loading: false,
  error: null,
};
