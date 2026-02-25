import "dotenv/config";
import * as schema from "./schema/index.js";
import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
});
client.connect();

export const db = drizzle(client, { schema });
export * from "./schema/index.js";
