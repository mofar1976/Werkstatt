import type { AuthAudience, UserRole } from "./enums";

/** The authenticated account, as returned by the API (never includes secrets). */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  audience: AuthAudience;
  roles: UserRole[];
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds. */
  expiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

/** Decoded access-token claims the API puts on the request. */
export interface AccessTokenClaims {
  sub: string;
  aud: AuthAudience;
  roles: UserRole[];
}
