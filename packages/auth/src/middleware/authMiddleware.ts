import { createMiddleware } from "hono/factory";
import { auth, type AuthUser } from "../auth.js";
import type { AuthEnv } from "../types.js";

export const getUser = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: "Unauthorised. Please login" }, 401);
    }
    c.set("user", session.user as AuthUser);
    await next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return c.json({ error: "Unauthorised" }, 401);
  }
});

export const requireRole = (...roles: string[]) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.roles)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    await next();
  });
