/**
 * Fixed secrets for tests. None of these are real credentials: the Stripe
 * keys only ever talk to the in-process fake (see fake-stripe.ts).
 */
export const TEST_ENV = {
  BETTER_AUTH_SECRET: "test-only-better-auth-secret-0123456789abcdef",
  STRIPE_SECRET_KEY: "sk_test_fake",
  STRIPE_WEBHOOK_SECRET: "whsec_test_fake",
  DATABASE_SSL: "false",
  DB_POOL_MAX: "10",
  NODE_ENV: "test",
} as const;

/** Server that disposable test databases are created on. */
export const TEST_DATABASE_ADMIN_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://postgres@localhost:5432/postgres";
