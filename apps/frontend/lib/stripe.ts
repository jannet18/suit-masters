// import { loadStripe } from "@stripe/stripe-js";

// export const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
// );

import { loadStripe, Stripe } from "@stripe/stripe-js";

// Support both naming conventions so the key is found regardless of how it's
// defined in the environment (.env uses NEXT_PUBLIC_STRIPE_PUBLIC_KEY).
const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

if (!publishableKey) {
  console.error(
    "CRITICAL: Stripe publishable key is not defined. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or NEXT_PUBLIC_STRIPE_PUBLIC_KEY) in your environment variables.",
  );
}

// This prevents the runtime crash by evaluating safely
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;