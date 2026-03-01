// import { loadStripe } from "@stripe/stripe-js";

// export const stripePromise = loadStripe(
//   process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
// );
// lib/stripe-client.ts
// import { loadStripe, Stripe } from "@stripe/stripe-js";

// let stripePromise: Promise<Stripe | null>;
// export const getStripe = () => {
//   if (!stripePromise) {
//     stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
//   }
//   return stripePromise;
// };

import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);
