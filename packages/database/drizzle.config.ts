import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // This glob pattern tells Drizzle to look at every file in your schema folder
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Keeps your table names clean
  verbose: true,
  strict: true,
});
