import { authRoute } from "./routes/verify.js";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
export type { AuthContext } from "./types.js";
// export interface AuthContext {
//   userId: string;
//   email: string;
//   roles: string[];
// }

const app = new Hono();

app.use("*", logger());

// Add CORS so your Next.js frontend can talk to this backend
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: "Internal Server Error", detail: err.message }, 500);
});
const apiRoutes = app.basePath("/api").route("/auth", authRoute); // Change "/" to "/auth" for clarity

export default app;
