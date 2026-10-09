import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import pg from "pg";
import { TEST_DATABASE_ADMIN_URL } from "./env.js";

/**
 * Disposable databases: each test run gets its own, freshly migrated
 * database on the TEST_DATABASE_URL server, dropped afterwards. Runs never
 * share state, so services can be tested in parallel and in CI.
 */

export function repoRoot(): string {
  // Walk up from the working directory (works under both ESM and the CommonJS
  // loader Playwright uses for apps that aren't "type": "module")
  let dir = process.cwd();
  while (!existsSync(join(dir, "turbo.json"))) {
    const parent = dirname(dir);
    if (parent === dir)
      throw new Error("Could not find the monorepo root (turbo.json)");
    dir = parent;
  }
  return dir;
}

function urlForDatabase(name: string): string {
  const url = new URL(TEST_DATABASE_ADMIN_URL);
  url.pathname = `/${name}`;
  return url.toString();
}

async function withAdminClient<T>(
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new pg.Client({ connectionString: TEST_DATABASE_ADMIN_URL });
  try {
    await client.connect();
  } catch (error) {
    throw new Error(
      `Cannot reach the test Postgres server at ${TEST_DATABASE_ADMIN_URL}. ` +
        `Start Postgres or set TEST_DATABASE_URL (see TESTING.md). ${(error as Error).message}`,
    );
  }
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Apply the current Drizzle schema to a database (drizzle-kit push). */
export function pushSchema(databaseUrl: string): void {
  const root = repoRoot();
  execFileSync(
    join(root, "node_modules/.bin/tsx"),
    [join(root, "node_modules/drizzle-kit/bin.cjs"), "push", "--force"],
    {
      cwd: join(root, "packages/database"),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    },
  );
}

export async function createTestDatabase(
  label: string,
  opts: { name?: string } = {},
) {
  const safeLabel = label.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  const name =
    opts.name ??
    `suit_test_${safeLabel}_${Date.now().toString(36)}_${process.pid}`;
  await withAdminClient(async (client) => {
    await client.query(`drop database if exists "${name}" with (force)`);
    await client.query(`create database "${name}"`);
  });
  const url = urlForDatabase(name);
  pushSchema(url);
  return { name, url };
}

export async function dropTestDatabase(name: string): Promise<void> {
  await withAdminClient((client) =>
    client.query(`drop database if exists "${name}" with (force)`),
  );
}
