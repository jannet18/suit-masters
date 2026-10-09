/** Standalone fake Stripe API for E2E runs: `tsx fake-stripe.ts` (PORT env). */
import { startFakeStripe } from "../fake-stripe.js";

const fake = await startFakeStripe(Number(process.env.PORT) || 0);
console.log(`Fake Stripe API listening on ${fake.url}`);
