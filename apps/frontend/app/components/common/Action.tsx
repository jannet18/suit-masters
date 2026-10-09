"use client";

import Link from "next/link";
import { Heart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@repo/auth/client";
import ShoppingCartIcon from "./ShoppingCart";
import { Button } from "@/components/ui/button";

function Action() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-x-2 ml-2 lg:ml-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="verical-line"></span>
          {session ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Log out
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="icon" className="p-0">
                  <User className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
              <Link href="/register">Register</Link>
            </div>
          )}
        </div>
        <Heart className="w-5 h-5 text-gray-600 cursor-pointer" />
        <ShoppingCartIcon />
      </div>

      {/* Cart */}
      <div className="space-x-2 flex relative cursor-pointer mt-0.5">
        <div className="py-1 px-3.5">
          <div className="cart-number"></div>
        </div>
      </div>
    </div>
  );
}

export default Action;
