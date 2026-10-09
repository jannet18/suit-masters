import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "product-service",
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    // One disposable, migrated Postgres database for this package's run
    globalSetup: ["@repo/testing/vitest/global-setup"],
    // Test env, DATABASE_URL and a fake Stripe API, set before app imports
    setupFiles: ["@repo/testing/vitest/setup"],
    // Files share the package database; run them one at a time
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 120_000,
  },
});
