import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentRoutes } from "./routes/paymentRoutes";

const app = new Hono();
const port = Number(process.env.PORT) || 4002;

app.get("/health", (c) => c.json({ status: "ok", service: "payment-service" }));

// app.get("/stripe-test", async (c) => {
//   const acct = await Stripe.accounts.retrieve(); // just to test
//   return c.json({ status: "ok", account: acct.id });
// });

app.route("/payments", paymentRoutes);
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Payment Service is running on port ${info.port}`);
  },
);
