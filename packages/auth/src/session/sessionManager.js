import { createKindeServerClient, GrantType, } from "@kinde-oss/kinde-typescript-sdk";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
// Client for authorization code flow
export const kindeClient = createKindeServerClient(GrantType.AUTHORIZATION_CODE, {
    authDomain: process.env.KINDE_DOMAIN,
    clientId: process.env.KINDE_CLIENT_ID,
    clientSecret: process.env.KINDE_CLIENT_SECRET,
    redirectURL: process.env.KINDE_REDIRECT_URI,
    logoutRedirectURL: process.env.KINDE_LOGOUT_URI,
});
let store = {};
export const sessionManager = (c) => ({
    async getSessionItem(key) {
        const result = getCookie(c, key);
        return result;
    },
    async setSessionItem(key, value) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        };
        if (typeof value === "string") {
            setCookie(c, key, value, cookieOptions);
        }
        else {
            setCookie(c, key, JSON.stringify(value), cookieOptions);
        }
    },
    async removeSessionItem(key) {
        deleteCookie(c, key);
    },
    async destroySession() {
        ["id_token", "access_token", "user", "refresh_token"].forEach((key) => {
            deleteCookie(c, key);
        });
    },
});
