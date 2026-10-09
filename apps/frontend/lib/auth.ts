import { authClient } from "@repo/auth/client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  picture?: string | null;
  phone?: string | null;
  address?: string | null;
  roles?: string;
}

/** The signed-in user from the Better Auth session, or null if signed out. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data } = await authClient.getSession();
  // phone/address/roles are Better Auth additionalFields, present at runtime
  return (data?.user as CurrentUser | undefined) ?? null;
}

/** Login page that returns the user to `redirect` (a same-site path) afterwards. */
export function loginUrl(redirect: string): string {
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}
