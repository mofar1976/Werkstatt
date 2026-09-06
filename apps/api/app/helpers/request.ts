import type { Request } from "express";
import { HttpError } from "./http-error.js";

/** Read a route parameter that the route definition guarantees exists. */
export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  const single = Array.isArray(value) ? value[0] : value;
  if (single === undefined) {
    throw HttpError.badRequest(`Missing route parameter: ${name}`);
  }
  return single;
}
