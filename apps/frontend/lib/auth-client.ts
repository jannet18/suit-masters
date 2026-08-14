import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:4004",
});

export const { useSession, signIn, signOut, signUp } = authClient;
