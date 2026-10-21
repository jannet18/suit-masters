import Stripe from "stripe";
/**
 * The service's Stripe client. STRIPE_API_HOST/PORT/PROTOCOL point it at a
 * local fake (tests and E2E runs, like Stripe's own stripe-mock); in
 * production they are unset and the SDK talks to api.stripe.com.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20.acacia",
    ...(process.env.STRIPE_API_HOST
        ? {
            host: process.env.STRIPE_API_HOST,
            port: Number(process.env.STRIPE_API_PORT) || 443,
            protocol: process.env.STRIPE_API_PROTOCOL || "https",
        }
        : {}),
});
