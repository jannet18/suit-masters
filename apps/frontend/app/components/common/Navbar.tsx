"use client";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import NavbarClient from "./NavbarClient";

interface NavbarProps {
  onOpenFitting?: () => void;
}

export default async function Navbar(props: NavbarProps) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return <NavbarClient user={user} {...props} />;
}
