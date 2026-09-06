/** localStorage keys used by the Customer portal. */
export const STORAGE_KEYS = {
  accessToken: "cg.cu.accessToken",
  refreshToken: "cg.cu.refreshToken",
  user: "cg.cu.user",
} as const;

/** Route paths, referenced instead of magic strings. */
export const ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/",
} as const;

/** This portal logs into the CUSTOMER auth portal. */
export const AUTH_AUDIENCE = "customer";
