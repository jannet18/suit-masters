"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

const CHROMELESS_ROUTES = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (CHROMELESS_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="min-w-0 w-full flex-1 overflow-y-auto">
        <Navbar />
        <div className="min-w-0 p-4 md:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
