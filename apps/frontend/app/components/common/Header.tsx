import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { Navbar } from "./Navbar";

const Header = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Navbar user={session?.user ?? null} />
    </>
  );
};

export default Header;
