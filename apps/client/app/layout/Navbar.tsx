import Link from "next/link";
import SearchBar from "../components/common/SearchBar";
import { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserButton from "./Account";

async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // const isAdmin = user?.role  === "admin";
  console.log("NAVBAR SERVER USER:", user);

  return (
    <nav className="w-full border-b border-gray-200 p-4">
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
        <Suspense
          fallback={
            <div className="w-48 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          }
        >
          <SearchBar />
        </Suspense>
        {/* RIGHT */}
        <UserButton user={user} />
      </div>
    </nav>
  );
}

export default Navbar;
