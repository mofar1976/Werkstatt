/** localStorage keys used by the Workshop portal. */
export const STORAGE_KEYS = {
  accessToken: "cg.ws.accessToken",
  refreshToken: "cg.ws.refreshToken",
  user: "cg.ws.user",
} as const;

/** Route paths, referenced instead of magic strings. */
export const ROUTES = {
  login: "/login",
  dashboard: "/",
} as const;

/** This portal logs into the WORKSHOP auth portal. */
export const AUTH_AUDIENCE = "workshop";
