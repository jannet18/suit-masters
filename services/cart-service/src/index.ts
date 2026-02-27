import { serve } from "@hono/node-server";
import app from "./app.js";
import { cors } from "hono/cors";

const port = Number(process.env.PORT) || 10000;

console.log(`🛒 Cart Service starting on port ${port}`);
app.use(
  "/api/*",
  cors({
    origin: ["https://suit-masters.vercel.app", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`✅ Cart Service is listening at http://0.0.0.0:${info.port}`);
  },
);
