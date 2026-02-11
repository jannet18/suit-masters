import { sql } from "drizzle-orm";
import { db } from "./src";

async function main() {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Database reset is not allowed in production environment",
      );
    }
    console.log("Checking schema");
    const result = await db.execute(
      sql`SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public';`,
    );
    if (result.rows.length === 0) {
      console.log("Schema does not exist, creating schema...");
      await db.execute(sql`CREATE SCHEMA public;`);
      console.log("Schema created.");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error checking schema:", error);
  }
  console.log("Dropping schema...");
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);
  console.log("Schema reset complete.");
  process.exit(0);
}
main();
