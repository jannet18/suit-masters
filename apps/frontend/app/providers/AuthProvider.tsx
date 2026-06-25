"use client";
import { KindeProvider, useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useRef } from "react";
import { useCartStore } from "../stores/useCartStore";

/**
 * Inner component that has access to the Kinde auth state.
 * Syncs the local cart with the server cart when the user first becomes authenticated.
 */
function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useKindeBrowserClient();
  const syncWithServer = useCartStore((state) => state.syncWithServer);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      // Sync local cart with server cart on first authentication
      syncWithServer();
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
