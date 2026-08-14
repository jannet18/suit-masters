"use client";
import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useCartStore } from "../stores/useCartStore";

/**
 * Syncs the local cart with the server cart when the user first becomes authenticated.
 * handle state reset on logout to permit subsequent user sync actions
 */
function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAuthenticated = !!session;
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      if(!hasSynced.current) {
      hasSynced.current = true;
      // Sync local cart with server cart on authentication handshaking
      syncWithServer();
    }
  }else {
// Hardened: Reset key if the user logs out so a future login can re-sync
    hasSynced.current = false;
  }
}, [isAuthenticated, syncWithServer]);

  return <>{children}</>;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <CartSyncProvider>{children}</CartSyncProvider>;
};
