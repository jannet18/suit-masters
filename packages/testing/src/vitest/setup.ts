import { afterAll, inject } from "vitest";
import { TEST_ENV } from "../env.js";
import { fakeStripeEnv, startFakeStripe } from "../fake-stripe.js";

/**
 * Per-test-file setup. Runs before the test file's imports are evaluated, so
 * services and @repo/db read these values when they initialise.
 */
Object.assign(process.env, TEST_ENV, { DATABASE_URL: inject("databaseUrl") });

/** Fake Stripe API for this test file; services' Stripe clients point at it. */
export const fakeStripe = await startFakeStripe();
Object.assign(process.env, fakeStripeEnv(fakeStripe));
(globalThis as { __fakeStripe?: typeof fakeStripe }).__fakeStripe = fakeStripe;

afterAll(() => fakeStripe.close());
