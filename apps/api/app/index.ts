import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { errorHandler, notFoundHandler } from "./helpers/error-middleware.js";
import { apiRouter } from "./routes/index.js";
import { env } from "./utils/env.js";
import { logger } from "./utils/logger.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.webOrigins, credentials: true }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
