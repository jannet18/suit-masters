import "dotenv/config";
import * as schema from "./schema/index.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // DATABASE_SSL=false for local/test Postgres without TLS (e.g. CI containers)
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
  // scale dynamically
  max: process.env.DB_POOL_MAX
    ? Number(process.env.DB_POOL_MAX)
    : isProduction
      ? 10
      : 1,
  // A TLS handshake to a remote Postgres (e.g. Neon) can take 2s+ on its own,
  // so allow time to connect, and keep idle connections warm so requests
  // don't pay that cost every time.
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 10_000,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30_000,
  keepAlive: true,
});

export const db = drizzle(pool, { schema });

export * from "./schema/index.js";
