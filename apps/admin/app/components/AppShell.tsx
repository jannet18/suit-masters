"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./AppSidebar";
import Navbar from "./Navbar";

const CHROMELESS_ROUTES = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (CHROMELESS_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
