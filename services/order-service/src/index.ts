import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { orderRoutes } from "./routes/orderRoutes.js";

export const app = new Hono();

const port = Number(process.env.PORT) || 4001;

app.get("/health", (c) => c.json({ status: "order-service ok" }));

app.route("/orders", orderRoutes);
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Order Service is running on port ${info.port}`);
  },
);
