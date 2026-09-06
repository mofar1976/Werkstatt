import type { RequestHandler } from "express";
import type { AuthAudience } from "@car-garage/shared";
import { HttpError } from "../helpers/http-error.js";
import { loginSchema, refreshSchema, registerSchema } from "../dto/auth.dto.js";
import { authService } from "../services/auth.service.js";

/** Builds the set of auth handlers bound to one portal audience. */
export function makeAuthController(audience: AuthAudience) {
  const register: RequestHandler = (req, res, next) => {
    const input = registerSchema.parse(req.body);
    authService
      .register(audience, input)
      .then((result) => res.status(201).json(result))
      .catch(next);
  };

  const login: RequestHandler = (req, res, next) => {
    const input = loginSchema.parse(req.body);
    authService
      .login(audience, input, req.header("user-agent"))
      .then((result) => res.json(result))
      .catch(next);
  };

  const refresh: RequestHandler = (req, res, next) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    authService
      .refresh(audience, refreshToken)
      .then((result) => res.json(result))
      .catch(next);
  };

  const logout: RequestHandler = (req, res, next) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    authService
      .logout(refreshToken)
      .then(() => res.status(204).end())
      .catch(next);
  };

  const me: RequestHandler = (req, res, next) => {
    if (!req.auth) {
      next(HttpError.unauthorized());
      return;
    }
    authService
      .getById(req.auth.sub)
      .then((user) => res.json(user))
      .catch(next);
  };

  return { register, login, refresh, logout, me };
}
