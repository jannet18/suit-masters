import "dotenv/config";
import * as schema from "./schema/index.js";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
const {Pool} = pg
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // scale dynamically 
  max: process.env.DB_POOL_MAX ? Number(process.env.DB_POOL_MAX): (isProduction ? 10:1),
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000
});

export const db = drizzle(pool, { schema });

export * from "./schema/index.js";
