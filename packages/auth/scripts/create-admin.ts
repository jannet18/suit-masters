/**
 * One-off bootstrap: creates a real account through Better Auth's own
 * server API (so the password hash is correct and verifiable normally),
 * then promotes it straight in the database — the client API can't set
 * `roles` itself (see emailAndPassword.additionalFields in src/auth.ts).
 *
 *   npx tsx --env-file=../../.env scripts/create-admin.ts <email> <password> [name]
 *
 * Safe to re-run: if the account already exists, it skips creation and
 * just (re)promotes the existing user to ADMIN.
 */
import { auth } from "../src/auth.js";
import { hashPassword } from "better-auth/crypto";
import { db, usersTable, account, eq, and } from "@repo/db";

async function main() {
  const [, , email, password, name] = process.argv;
  if (!email || !password) {
    console.error("Usage: tsx scripts/create-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: { email, password, name: name || "Admin" },
    });
    console.log(`Created account for ${email}.`);
  } else {
    // Account already exists — make sure the password actually matches what
    // was just asked for, rather than silently keeping whatever was set
    // before (which the caller has no way to know).
    const hash = await hashPassword(password);
    const updatedRows = await db
      .update(account)
      .set({ password: hash })
      .where(and(eq(account.userId, existing.id), eq(account.providerId, "credential")))
      .returning();

    if (updatedRows.length === 0) {
      throw new Error(
        `${email} exists but has no credential (email/password) account to update.`,
      );
    }
    console.log(`${email} already exists — password reset to match, promoting to ADMIN.`);
  }

  const [updated] = await db
    .update(usersTable)
    .set({ roles: "ADMIN" })
    .where(eq(usersTable.email, email))
    .returning();

  if (!updated) {
    throw new Error(`Could not find ${email} after signup — something went wrong.`);
  }

  console.log(`${updated.email} is now ADMIN (id: ${updated.id}).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
