import Stripe from "stripe";
import { TEST_ENV } from "./env.js";

const signer = new Stripe(TEST_ENV.STRIPE_SECRET_KEY);

/**
 * Build a Stripe webhook request body and a valid `stripe-signature` header,
 * exactly as Stripe would send it, signed with the test webhook secret.
 */
export function signedStripeEvent(
  type: string,
  object: Record<string, unknown>,
  secret: string = TEST_ENV.STRIPE_WEBHOOK_SECRET,
) {
  const payload = JSON.stringify({
    id: `evt_test_${Math.random().toString(36).slice(2)}`,
    object: "event",
    type,
    created: Math.floor(Date.now() / 1000),
    data: { object },
  });
  const signature = signer.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  return { payload, signature };
}
