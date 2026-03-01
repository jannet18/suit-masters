import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Navbar } from "./Navbar";

const Header = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <>
      <Navbar user={user} />
    </>
  );
};

export default Header;
