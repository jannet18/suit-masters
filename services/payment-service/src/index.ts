import { Context, Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentRoutes } from "./routes/paymentRoutes.js";
import { webhookRoutes } from "./routes/webhook.js";
import { cors } from "hono/cors";
import { type AuthContext } from "@repo/auth";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

const app = new Hono<AuthContext>();
const port = Number(process.env.PORT) || 4002;

app.use(
  "*",
  cors({
    origin: [
      "https://suit-masters.vercel.app",
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.route("/webhook", webhookRoutes);

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
