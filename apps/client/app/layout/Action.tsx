import { Button } from "@/components/ui/button";
import {
  LoginLink,
  LogoutLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs";
import { Heart, User } from "lucide-react";
import ShoppingCartIcon from "../components/common/ShoppingCart";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

async function Action() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  // const { isAuthenticated, getUser } = getKindeServerSession();
  // const user = await getUser();
  return (
    <div className="flex items-center justify-end gap-x-2 ml-2 lg:ml-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="verical-line"></span>
          {user ? (
            <LogoutLink>
              <Button variant="outline" size="sm">
                Log out
              </Button>
            </LogoutLink>
          ) : (
            <div className="flex items-center gap-4">
              <LoginLink>
                <Button variant="ghost" size="icon" className="p-0">
                  <User className="w-5 h-5 text-gray-600" />
                </Button>
              </LoginLink>
              <RegisterLink className="">Register</RegisterLink>
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
