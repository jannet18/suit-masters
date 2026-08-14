import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { orderRoutes } from "./routes/orderRoutes.js";
import { refundRoutes } from "./routes/refundRoutes.js";
import { getUser, type AuthContext } from "@repo/auth";
import { cors } from "hono/cors";
import { errorHandler, notFoundHandler } from "@repo/error-handling";

export const app = new Hono<AuthContext>();

const port = Number(process.env.PORT) || 4001;

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

app.get("/health", (c) => c.json({ status: "order-service ok" }));
app.use("/orders/*", getUser as any);
app.use("/refunds/*", getUser as any);
app.route("/orders", orderRoutes);
app.route("/refunds", refundRoutes);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Order Service is running on port ${info.port}`);
  },
);
