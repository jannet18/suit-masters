import Stripe from "stripe";
/**
 * The service's Stripe client. STRIPE_API_HOST/PORT/PROTOCOL point it at a
 * local fake (tests and E2E runs, like Stripe's own stripe-mock); in
 * production they are unset and the SDK talks to api.stripe.com.
 */
export declare const stripe: Stripe;
//# sourceMappingURL=stripe.d.ts.map