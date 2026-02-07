import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/schema.js";

// // Export the client so apps can use it
// export const createDb = (connectionString: string) => {
//   const client = neon(connectionString);
//   return drizzle(client, { schema });
// };

// // Export types for your frontend/backend use
// export * from "drizzle-orm";
// export * from "./schema/schema";
// packages/database/src/index.ts
const connectionString = process.env.DATABASE_URL!;
const client = neon(connectionString);

// Export a ready-to-use instance
export const db = drizzle(client, { schema });

export * from "./schema/schema.ts";
