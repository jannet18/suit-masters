import Link from "next/link";
import { Heart, User } from "lucide-react";
import { getServerSession } from "@/lib/get-server-session";
import ShoppingCartIcon from "./ShoppingCart";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./SignOutButton";

async function Action() {
  const session = await getServerSession();

  return (
    <div className="flex items-center justify-end gap-x-2 ml-2 lg:ml-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="verical-line"></span>
          {session?.user ? (
            <SignOutButton>
              <Button variant="outline" size="sm">
                Log out
              </Button>
            </SignOutButton>
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
        {/* <Bell className="w-5 h-5 text-gray-600 cursor-pointer" /> */}
      </div>
      {/* <Button onClick={() => router.push("/login")}>Login</Button> */}

      {/* Cart */}
      <div className="space-x-2 flex relative cursor-pointer mt-0.5">
        <div className="py-1 px-3.5">
          <div className="cart-number"></div>
        </div>
      </div>
      {/*Loader  */}
      <span className="animate-spin size-8" />
    </div>
  );
}

export default Action;
