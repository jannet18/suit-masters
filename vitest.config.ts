import { defineConfig } from "vitest/config";

/**
 * Runs every package's Vitest project in one process (`npx vitest`), e.g.
 * for an editor's test explorer. `npm test` runs them per package via Turbo.
 */
export default defineConfig({
  test: {
    projects: ["packages/*/vitest.config.ts", "services/*/vitest.config.ts"],
    // Service test files share a database per project; run files serially
    fileParallelism: false,
  },
});
