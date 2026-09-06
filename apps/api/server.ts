import { createApp } from "./app/index.js";
import { connectDatabase, disconnectDatabase } from "./app/models/db.js";
import { env } from "./app/utils/env.js";
import { logger } from "./app/utils/logger.js";

async function start() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.API_PORT, () => {
    logger.info(`API listening on http://localhost:${env.API_PORT}/api`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error({ err }, "Failed to start API");
  process.exit(1);
});
