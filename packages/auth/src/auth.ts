import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, usersTable, session, account, verification } from "@repo/db";
import { Resend } from "resend";
import { sendResetPasswordEmail } from "./emails/reset-password.js";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET missing");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session,
      account,
      verification,
    },
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    // Better Auth's own `url` points at its API callback route; we build our
    // own link to a storefront page instead so the reset flow is custom UI.
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

      if (!resend) {
        console.warn(
          `RESEND_API_KEY not set - password reset link for ${user.email}: ${resetUrl}`,
        );
        return;
      }

      await sendResetPasswordEmail(resend, { to: user.email, resetUrl });
    },
  },
  user: {
    fields: {
      image: "picture",
    },
    additionalFields: {
      roles: {
        type: "string",
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
    },
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = Session["user"];
