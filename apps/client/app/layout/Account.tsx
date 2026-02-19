"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, ShoppingBag, UserCog } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

type UserButtonProps = {
  user: KindeUser<Record<string, any>> | null;
};
const UserButton = ({ user }: UserButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  //  const isAdmin = user.role === "admin";

  // guest
  if (!user) {
    return (
      <button
        onClick={() => {
          toast.info("Please sign in to continue");
          router.push(`/api/auth/login?redirect=${pathname}`);
        }}
        className="px-3 py-1 border rounded-md hover:bg-gray-100"
      >
        Sign in / Register
      </button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-10 items-center rounded-xl cursor-pointer text-gray-600">
          <AvatarImage src={user?.picture || ""} alt="avatar" />
          <AvatarFallback className="rounded-xl p-4">
            {user?.given_name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 bg-card z-70  border-none">
        {/* { && (
          <DropdownMenuItem
            // onClick={() => router.push(`/admin/${session.data?.user?.id}`)}
            className="cursor-pointer"
          >
            <LayoutDashboard className="size-6 mr-2" />
            <span className="font-bold">Admin Dashboard</span>
          </DropdownMenuItem>
        )} */}
        <DropdownMenuItem
          onClick={() => router.push(`/user/${pathname}`)}
          className="cursor-pointer"
        >
          <UserCog className="size-6 mr-2" />
          <span className="font-bold">User Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/account/orders")}
          className="cursor-pointer"
        >
          <ShoppingBag className="size-6 mr-2" />
          <span className="font-bold">View Orders</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            toast.success("Signed out");
            router.push("/api/auth/logout");
          }}
        >
          <LogOut className="size-6 mr-2" />
          <span className="font-bold">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
