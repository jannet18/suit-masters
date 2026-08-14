import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.js";
import type { AuthContext } from "../types.js";

export const getUser = createMiddleware<AuthContext>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorised. Please login" }, 401);
  }
  c.set("user", session.user);
  await next();
});
