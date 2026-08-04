import { serve } from "@hono/node-server";
import app from "./app.js";
import { cors } from "hono/cors";
const port = Number(process.env.PORT) || 4000;

// Apply CORS to all routes
app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Product Service is running on port ${port}`);
