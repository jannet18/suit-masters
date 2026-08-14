import type { auth } from "./lib/auth.js";

export type SessionUser = typeof auth.$Infer.Session.user;

export type AuthContext = {
  Variables: {
    user: SessionUser;
  };
};
