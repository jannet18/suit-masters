import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Export the client so apps can use it
export const createDb = (connectionString: string) => {
  const client = neon(connectionString);
  return drizzle(client, { schema });
};

// Export types for your frontend/backend use
export * from "drizzle-orm";
export * from "./schema";
