"use client";
// // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// // import {
// //   DropdownMenu,
// //   DropdownMenuContent,
// //   DropdownMenuItem,
// //   DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";
// // import { authClient } from "@/lib/auth-client";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const UserButton = ({ isAdmin }: { isAdmin: boolean }) => {
//   // const router = useRouter();
//   const session = authClient.useSession();
//   // const user = session.data?.user;

//   // const handleLogout = async () => {
//   //   router.push("/");
//   //   await authClient.signOut();
//   // };
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         {/* <Avatar className="size-10 items-center rounded-xl cursor-pointer">
//           <AvatarImage src={user?.image || ""} alt="avatar" />
//           <AvatarFallback className="rounded-xl">
//             {user?.name?.charAt(0).toUpperCase() || "U"}
//           </AvatarFallback>
//         </Avatar> */}
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-52 bg-card z-70  border-none">
//         {isAdmin && (
//           <DropdownMenuItem
//             // onClick={() => router.push(`/admin/${session.data?.user?.id}`)}
//             className="cursor-pointer"
//           >
//             {/* <MdDashboard className="size-6 mr-2" />
//             <span className="font-bold">Admin Dashboard</span> */}
//           </DropdownMenuItem>
//         )}
//         <DropdownMenuItem
//           // onClick={() => router.push(`/user/${session.data?.user?.id}`)}
//           className="cursor-pointer"
//         >
//           {/* <MdDashboard className="size-6 mr-2" /> */}
//           <span className="font-bold">User Dashboard</span>
//         </DropdownMenuItem>

//         <DropdownMenuItem
//         // onClick={() => router.push("/orders")}
//         // className="cursor-pointer"
//         >
//           {/* <BsFillCartCheckFill className="size-6 mr-2" /> */}
//           <span className="font-bold">View Orders</span>
//         </DropdownMenuItem>
//         <DropdownMenuItem
//           // onClick={handleLogout}
//           className="cursor-pointer"
//         >
//           {/* <MdLogout className="size-6 mr-2" /> */}
//           <span className="font-bold">Sign Out</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// export default UserButton;

import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

type UserButtonProps = {
  user: KindeUser<Record<string, any>> | null;
};

export default function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

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

  // const isAdmin = user.role === "admin";

  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Avatar className="w-10 h-10 rounded-full cursor-pointer">
    //       <AvatarImage src={user.image || ""} alt={user.name || "User"} />
    //       <AvatarFallback>
    //         {user.name?.charAt(0).toUpperCase() || "U"}
    //       </AvatarFallback>
    //     </Avatar>
    //   </DropdownMenuTrigger>

    //   <DropdownMenuContent className="w-52 bg-card border-none z-50">
    //     {isAdmin && (
    //       <DropdownMenuItem onClick={() => router.push("/admin/dashboard")}>
    //         <span className="font-bold">Admin Dashboard</span>
    //       </DropdownMenuItem>
    //     )}

    //     <DropdownMenuItem onClick={() => router.push("/user/profile")}>
    //       <span className="font-bold">Profile</span>
    //     </DropdownMenuItem>

    //     <DropdownMenuItem onClick={() => router.push("/orders")}>
    //       <span className="font-bold">My Orders</span>
    //     </DropdownMenuItem>

    //     <DropdownMenuItem
    //       onClick={async () => {
    //         await fetch("/api/auth/logout", {
    //           method: "POST",
    //           credentials: "include",
    //         });
    //         router.push("/");
    //         setUser(null);
    //       }}
    //     >
    //       <span className="font-bold">Sign Out</span>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger className="cursor-pointer">
        <img
          src={user.picture || "/avatar.png"}
          alt="avatar"
          className="w-9 h-9 rounded-full"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-52">
        <DropdownMenuItem onClick={() => router.push("/account/orders")}>
          My Orders
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            toast.success("Signed out");
            router.push("/api/auth/logout");
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
