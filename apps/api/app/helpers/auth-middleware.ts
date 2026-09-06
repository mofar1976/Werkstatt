import type { RequestHandler } from "express";
import { AuthAudience, UserRole } from "@car-garage/shared";
import { HttpError } from "./http-error.js";
import { verifyAccessToken } from "./jwt.js";

export function requireAuth(audience: AuthAudience): RequestHandler {
  return (req, _res, next) => {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      next(HttpError.unauthorized("Missing bearer token"));
      return;
    }
    verifyAccessToken(header.slice("Bearer ".length), audience)
      .then((claims) => {
        req.auth = claims;
        next();
      })
      .catch(next);
  };
}

/** Require the authenticated user to hold at least one of the given roles. */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(HttpError.unauthorized());
      return;
    }
    if (!req.auth.roles.some((role) => roles.includes(role))) {
      next(HttpError.forbidden("Insufficient permissions"));
      return;
    }
    next();
  };
}

/** Guard for Backoffice routes: a valid admin-portal token with PLATFORM_ADMIN. */
export const requirePlatformAdmin: RequestHandler[] = [
  requireAuth(AuthAudience.ADMIN),
  requireRole(UserRole.PLATFORM_ADMIN),
];
