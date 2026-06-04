import { Context, Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentRoutes } from "./routes/paymentRoutes.js";
import { cors } from "hono/cors";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

const app = new Hono();
const port = Number(process.env.PORT) || 4002;

app.use(
  "/api/*",
  cors({
    origin: ["https://suit-masters.vercel.app", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.get("/health", (c: Context) =>
  c.json({ status: "ok", service: "payment-service" }),
);

// app.get("/stripe-test", async (c) => {
//   const acct = await Stripe.accounts.retrieve(); // just to test
//   return c.json({ status: "ok", account: acct.id });
// });

app.route("/payments", paymentRoutes);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Payment Service is running on port ${info.port}`);
  },
);
