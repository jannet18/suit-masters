import "dotenv/config";
import * as schema from "./schema/index.js";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
});
// const client = new Client({
//   connectionString: process.env.DATABASE_URL!,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
// client.connect();

export const db = drizzle(pool, { schema });
export * from "./schema/index.js";
