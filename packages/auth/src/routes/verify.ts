import { Hono } from "hono";
import { kindeClient, sessionManager } from "../session/sessionManager.js";
import { getUser } from "@repo/auth";
// import process from "node:process";

export const authRoute = new Hono()
  .get("/login", async (c) => {
    const loginUrl = await kindeClient.login(sessionManager(c));
    return c.redirect(loginUrl.toString());
  })

  .get("/register", async (c) => {
    const registerUrl = await kindeClient.register(sessionManager(c));
    return c.redirect(registerUrl.toString());
  })
  .get("/kinde_callback", async (c) => {
    const url = new URL(c.req.url);
    const manager = sessionManager(c)
    await kindeClient.handleRedirectToApp(manager, url)
    // await kindeClient.handleRedirectToApp(sessionManager(c), url);

    // dynamic fallback to handle production envronments seamlessly
    const targetRedirect = process.env.FRONTEND_URL || "http://localhost:3000"
     return c.redirect(targetRedirect);
  })
  .get("/logout", async (c) => {
    const logoutUrl = await kindeClient.logout(sessionManager(c));
    return c.redirect(logoutUrl.toString());
  })

  .get("/me", getUser, async (c) => {
    // const user = c.var.user;
    return c.json({ user: c.var.user });
  });
