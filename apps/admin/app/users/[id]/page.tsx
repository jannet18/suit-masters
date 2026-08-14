import { notFound } from "next/navigation";
import EditUser from "@/app/components/EditUser";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetTrigger } from "@/app/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Shield, User as UserIcon } from "lucide-react";
import { adminApi } from "@/lib/api-client";

const SingleUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { success, user } = await adminApi.getUserById(id);

  if (!success || !user) {
    notFound();
  }

  return (
    <div className="">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* USER BADGES CONTAINER */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            <h1 className="text-xl font-semibold">User Badges</h1>
            <div className="flex gap-4 mt-4">
              {user.roles === "ADMIN" ? (
                <HoverCard>
                  <HoverCardTrigger>
                    <Shield
                      size={36}
                      className="rounded-full bg-green-800/30 border border-green-800/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Admin</h1>
                    <p className="text-sm text-muted-foreground">
                      Admin users have access to all features and can manage
                      users.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <HoverCard>
                  <HoverCardTrigger>
                    <UserIcon
                      size={36}
                      className="rounded-full bg-blue-500/30 border border-blue-500/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Customer</h1>
                    <p className="text-sm text-muted-foreground">
                      Standard customer account.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          </div>
          {/* INFORMATION CONTAINER */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">User Information</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Edit User</Button>
                </SheetTrigger>
                <EditUser user={user} />
              </Sheet>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">Full Name:</span>
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Phone:</span>
                <span>{user.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Address:</span>
                <span>{user.address || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Role:</span>
                <span>{user.roles}</span>
              </div>
            </div>
            {user.created_at && (
              <p className="text-sm text-muted-foreground mt-4">
                Joined on {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-2/3 space-y-6">
          {/* USER CARD CONTAINER */}
          <div className="bg-primary-foreground p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="size-12">
                <AvatarImage src={user.picture || undefined} />
                <AvatarFallback>
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-semibold">{user.name}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;
