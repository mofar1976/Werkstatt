import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";

// Load the repo-root .env so infra and apps share one file.
const rootEnv = resolve(process.cwd(), "../../.env");
loadDotenv({
  path: existsSync(rootEnv) ? rootEnv : resolve(process.cwd(), ".env"),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z
    .string()
    .default(
      "http://localhost:4200,http://localhost:4300,http://localhost:4400",
    ),
  MONGODB_URI: z
    .string()
    .default("mongodb://localhost:27018/car_garage?replicaSet=rs0"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  // Object storage (MinIO in dev, any S3-compatible service in prod).
  S3_ENDPOINT: z.string().default("http://localhost:9000"),
  S3_REGION: z.string().default("us-east-1"),
  S3_ACCESS_KEY: z.string().default("minioadmin"),
  S3_SECRET_KEY: z.string().default("minioadmin"),
  S3_BUCKET: z.string().default("car-garage"),
  S3_FORCE_PATH_STYLE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  /** Base URL objects are served from; defaults to `${S3_ENDPOINT}/${bucket}`. */
  S3_PUBLIC_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = {
  ...parsed.data,
  /** Allowed CORS origins as a list. */
  webOrigins: parsed.data.WEB_ORIGIN.split(",").map((o) => o.trim()),
};

export type Env = typeof env;
