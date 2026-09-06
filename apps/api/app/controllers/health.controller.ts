import type { RequestHandler } from "express";
import { healthService } from "../services/health.service.js";

export const healthController = {
  check: ((_req, res) => {
    res.json(healthService.getStatus());
  }) satisfies RequestHandler,
};
