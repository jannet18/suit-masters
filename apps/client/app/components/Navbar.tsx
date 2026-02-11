import Link from "next/link";
import Image from "next/image";
import { Heart, Home, SearchIcon, User } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCart";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

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
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={50}
            className="w-6 h-6 md:w-9 md:h-9"
          />
        </Link>
        {/* LEFT */}

        {/* <div>
          <Link href="/">
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
        </div> */}
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
                {/* <RegisterLink className="">Register</RegisterLink> */}
              </div>
            )}
          </div>
          <Heart className="w-5 h-5 text-gray-600 cursor-pointer" />
          <ShoppingCartIcon />
          {/* <Bell className="w-5 h-5 text-gray-600 cursor-pointer" /> */}
        </div>
      </div>
    </nav>
    // <nav className="w-full flex items-center justify-between py-4 border-b border-gray-200 mb-6">
    //   {/* LEFT */}
    //   <Link href="/">
    //     <Image
    //       src="/logo.png"
    //       alt="Logo"
    //       width={100}
    //       height={50}
    //       className="w-6 h-6 md:w-9 md:h-9"
    //     />
    //     <p className="hidden md:block text-md font-medium tracking-wider">
    //       Suit Masters
    //     </p>
    //   </Link>
    //   {/* RIGHT */}
    //   <div className="flex items-center gap-6">
    //     <SearchBar />
    //     <Link href="/">
    //       <Home className="w-4 h-4 text-gray-600" />
    //     </Link>
    //     <Bell className="w-4 h-4 text-gray-600" />
    //     <ShoppingCartIcon />
    //       {user ? (
    //     <LogoutLink>
    //       <button>Log out</button>
    //     </LogoutLink>
    //   ) : (
    //     <div className="flex items-center gap-4">
    //       <LoginLink>Log in</LoginLink>
    //       <RegisterLink className="">Register</RegisterLink>
    //     </div>
    //   )}

    //   </div>
    // </nav>
  );
}

export default Navbar;
