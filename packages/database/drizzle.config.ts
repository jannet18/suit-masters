// import { defineConfig } from "drizzle-kit";

// export default defineConfig({
//   schema: "packages/database/src/schema/schema.ts",
//   out: "packages/database/drizzle",
//   dbCredentials: {
//     url: process.env.DATABASE_URL!,
//   },

//   verbose: true,
//   strict: true,
//   dialect: "postgresql",
// } satisfies Parameters<typeof defineConfig>[0]);

import type { Config } from "drizzle-kit";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
export default {
  schema: "./src/schema/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
