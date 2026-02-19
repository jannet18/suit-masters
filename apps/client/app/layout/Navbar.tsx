import Link from "next/link";
import SearchBar from "../components/common/SearchBar";
import { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserButton from "./Account";
import Image from "next/image";

async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // console.log("NAVBAR SERVER USER:", user);

  return (
    <nav className="relative px-4 py-2 bg-white dark:bg-gray-800 border-b-2 dark:border-gray-600">
      <div className="flex items-center justify-evenly mx-auto gap-4">
        <Link
          href="/"
          className="flex flex-col items-start  justify-center text-2xl font-bold text-blue-600 dark:text-white"
        >
          <span className="text-lg text-heading font-semibold whitespace-nowrap tracking-wider">
            Suit Masters
          </span>
          <Image
            src="/logo.png"
            alt="Logo"
            width={20}
            height={20}
            className="w-6 h-6 md:w-9 md:h-9"
          />
        </Link>
        {/* <div className="lg:hidden">
          <button
            className="navbar-burger flex items-center text-violet-600 dark:text-gray-100 p-1"
            id="navbar_burger"
          >
            <svg
              className="block h-6 w-6 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Hamberger menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
            </svg>
          </button>
        </div> */}

        {/* LEFT */}
        <Suspense
          fallback={
            <div className="w-48 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          }
        >
          <SearchBar />
        </Suspense>
        {/* RIGHT */}
        <div className="block border rounded-md w-8 h-8">
          <UserButton user={user} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
