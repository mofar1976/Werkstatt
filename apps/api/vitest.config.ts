import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Integration tests hit a real MongoDB; be tolerant of load — turbo runs the
    // API and Angular test suites in parallel, which can slow mongoose.connect.
    testTimeout: 20_000,
    hookTimeout: 40_000,
  },
});
