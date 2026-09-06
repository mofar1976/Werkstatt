import { inject } from "@angular/core";
import type { HttpInterceptorFn } from "@angular/common/http";
import { StorageService } from "../services";

/** Attaches the bearer access token to same-API requests. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(StorageService).getTokens()?.accessToken;
  if (!token || req.headers.has("Authorization")) {
    return next(req);
  }
  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
