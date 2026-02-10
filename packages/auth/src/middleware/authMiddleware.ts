import { UserType } from "@kinde-oss/kinde-typescript-sdk";
import { kindeClient, sessionManager } from "../session/sessionManager.js";
import { createMiddleware } from "hono/factory";
type AuthEnv = {
  Variables: {
    user: UserType;
  };
};

export const getUser = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const manager = sessionManager(c);
    const isAuthenticated = await kindeClient.isAuthenticated(manager);
    if (!isAuthenticated) {
      return c.json({ error: "Unauthorised. Please login" }, 401);
    }
    const user = await kindeClient.getUserProfile(manager);
    c.set("user", user);
    await next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return c.json({ error: "Unauthorised" }, 401);
  }
});
