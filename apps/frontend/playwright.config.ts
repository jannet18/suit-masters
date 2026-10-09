import { defineConfig, devices } from "@playwright/test";
import { E2E_PORTS, e2eWebServers } from "@repo/testing/e2e";

/**
 * E2E for the frontend app. Starts its own database, fake Stripe API, the four
 * services and this app on dedicated ports (see @repo/testing/e2e).
 * Requires a Postgres server: TEST_DATABASE_URL (default localhost:5432).
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Journeys share one seeded database and build on each other's state
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${E2E_PORTS.frontend}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: e2eWebServers("frontend"),
});
