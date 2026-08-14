import { getServerSession } from "@/lib/get-server-session";
import { Navbar } from "./Navbar";

const Header = async () => {
  const session = await getServerSession();

  return (
    <>
      <Navbar user={session?.user ?? null} />
    </>
  );
};

export default Header;
