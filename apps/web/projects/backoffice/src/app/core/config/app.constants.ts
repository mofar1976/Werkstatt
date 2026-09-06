/** localStorage keys used by the Backoffice app. */
export const STORAGE_KEYS = {
  accessToken: "cg.bo.accessToken",
  refreshToken: "cg.bo.refreshToken",
  user: "cg.bo.user",
} as const;

/** Route paths, referenced instead of magic strings. */
export const ROUTES = {
  login: "/login",
  dashboard: "/",
  workshops: "/workshops",
} as const;

/** This Backoffice logs into the ADMIN auth portal. */
export const AUTH_AUDIENCE = "admin";
