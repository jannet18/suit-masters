import React from "react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { Bell, Home } from "lucide-react";
import ShoppingCartIcon from "./ShoppingCart";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";

function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-4 border-b border-gray-200 mb-6">
      {/* LEFT */}
      <Link href="/">
        <Image
          src="/logo.png"
          alt="Logo"
          width={100}
          height={50}
          className="w-6 h-6 md:w-9 md:h-9"
        />
        <p className="hidden md:block text-md font-medium tracking-wider">
          Suit Masters
        </p>
      </Link>
      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <SearchBar />
        <Link href="/">
          <Home className="w-4 h-4 text-gray-600" />
        </Link>
        <Bell className="w-4 h-4 text-gray-600" />
        <ShoppingCartIcon />
        {/* <Link href="/sign-in">Sign In</Link> */}
        <LoginLink>Sign In</LoginLink>
      </div>
    </nav>
  );
}

export default Navbar;
