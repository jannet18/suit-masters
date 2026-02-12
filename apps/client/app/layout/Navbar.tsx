import Link from "next/link";
import { Heart, SearchIcon, ShoppingBagIcon, User } from "lucide-react";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import {
  getKindeServerSession,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/server";
import ShoppingCartIcon from "../components/common/ShoppingCart";

async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  // const { isAuthenticated, getUser } = getKindeServerSession();
  // const user = await getUser();

  return (
    <nav className="w-full border-b border-gray-200">
      <div className="max-w-7xl flex items-center justify-between mx-auto pt-6">
        <Link href="/" className="flex flex-col items-center space-x-3">
          <span className="self-center text-lg text-heading font-semibold whitespace-nowrap">
            Suit Masters
          </span>
          {/* <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={50}
            className="w-6 h-6 md:w-9 md:h-9"
          /> */}
        </Link>
        {/* LEFT */}

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-gray-600" />{" "}
            <span className="verical-line"></span>
            {user ? (
              <LogoutLink>
                <button>Log out</button>
              </LogoutLink>
            ) : (
              <div className="flex items-center gap-4">
                <LoginLink>
                  <button>
                    <User className="w-5 h-5 text-gray-600" />
                  </button>
                </LoginLink>
                <RegisterLink className="">Register</RegisterLink>
              </div>
            )}
          </div>
          <Heart className="w-5 h-5 text-gray-600 cursor-pointer" />
          <ShoppingCartIcon />
          {/* <Bell className="w-5 h-5 text-gray-600 cursor-pointer" /> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
