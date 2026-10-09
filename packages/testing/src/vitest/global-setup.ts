import type { TestProject } from "vitest/node";
import { createTestDatabase, dropTestDatabase } from "../database.js";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

/**
 * Vitest globalSetup: one disposable, migrated database per package test run.
 * Use with `setupFiles: ["@repo/testing/vitest/setup"]`.
 */
export default async function setup(project: TestProject) {
  const { name, url } = await createTestDatabase(
    project.config.name || "vitest",
  );
  project.provide("databaseUrl", url);
  return async () => {
    if (process.env.KEEP_TEST_DB) {
      console.log(`Kept test database ${name} (KEEP_TEST_DB set)`);
      return;
    }
    await dropTestDatabase(name);
  };
}
