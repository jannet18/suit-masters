import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, usersTable } from "@repo/db";
import * as dbSchema from "@repo/db/schema";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET missing");
}

// The drizzle adapter looks up tables in `schema` by key name matching
// `modelName` below ("site_users"), but @repo/db exports the table as
// `usersTable` — alias it so the adapter can find it.
const authSchema = {
  ...dbSchema,
  site_users: usersTable,
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4004",
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.ADMIN_URL || "http://localhost:3002",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  // site_users.id is a Postgres-generated uuid default; let the DB assign it
  // instead of better-auth generating its own id.
  advanced: {
    database: {
      generateId: false,
    },
  },
  user: {
    modelName: "site_users",
    fields: {
      image: "picture",
    },
    additionalFields: {
      roles: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      address: {
        type: "string",
        required: false,
      },
      kinde_user_id: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});
