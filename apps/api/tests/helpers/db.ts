import { randomBytes } from "node:crypto";
import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";

/**
 * Connects Mongoose to a throwaway database on the configured MongoDB instance,
 * clears collections between tests, and drops the database afterwards. Each
 * call gets a uniquely-named database so test files can run in parallel.
 * Call once at the top of an integration test file.
 */
export function useTestDatabase(): void {
  const suffix = randomBytes(4).toString("hex");

  beforeAll(async () => {
    const base =
      process.env.MONGODB_URI ??
      "mongodb://localhost:27018/car_garage?replicaSet=rs0";
    const testUri = base.replace(
      /\/([^/?]+)(\?|$)/,
      `/$1_test_${suffix}$2`,
    );
    await mongoose.connect(testUri);
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(
      Object.values(collections).map((collection) => collection.deleteMany({})),
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
}
