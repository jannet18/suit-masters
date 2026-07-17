"use client";
import { KindeProvider, useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useRef } from "react";
import { useCartStore } from "../stores/useCartStore";

/**
 * Inner component that has access to the Kinde auth state.
 * Syncs the local cart with the server cart when the user first becomes authenticated.
 * handle state reset on logout to permit subsequent user sync actions
 */
function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useKindeBrowserClient();
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
  return (
    <KindeProvider>
      <CartSyncProvider>{children}</CartSyncProvider>
    </KindeProvider>
  );
};
