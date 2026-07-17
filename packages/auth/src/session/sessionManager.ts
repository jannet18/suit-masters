import {
  createKindeServerClient,
  GrantType,
  SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import { type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
// Client for authorization code flow

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_DOMAIN!,
    clientId: process.env.KINDE_CLIENT_ID!,
    clientSecret: process.env.KINDE_CLIENT_SECRET!,
    redirectURL: process.env.KINDE_REDIRECT_URI!,
    logoutRedirectURL: process.env.KINDE_LOGOUT_URI!,
  },
);

let store: Record<string, unknown> = {};

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    // const result = getCookie(c, key);
    // return result;
    const value = getCookie(c, key)
    if(!value) return null
    if(value.startsWith("{") || value.startsWith("[")){
      try { return JSON.parse(value)} catch {return value}
    }
  },
  async setSessionItem(key: string, value: unknown) {
    const isProd = process.env.NODE_ENV === "production"
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    } as const;

    const stringValue = typeof value === "string" ? value: JSON.stringify(value);
      setCookie(c, key, stringValue, cookieOptions);
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key, {path: "/"});
  },
  async destroySession() {
    const keys = ["id_token", "access_token", "user", "refresh_token", "kinde_oauth_state"];keys.forEach((key) => {
      deleteCookie(c, key, {path: "/"});
    });
  },
});
