"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings, User as UserIcon, ChevronDown } from "lucide-react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { usePathname, useRouter } from "next/navigation";

interface UserButtonProps {
  user: KindeUser<Record<string, any>> | null;
}

export default function UserButton({ user }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          router.push(`/api/auth/login?redirect=${pathname}`);
        }}
        className="flex items-center gap-2 group focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full border border-[#c9a96e]/30 overflow-hidden transition-transform group-hover:scale-105">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#2e2e2e] flex items-center text-white justify-center">
              <UserIcon size={16} className="text-white p-3" />
            </div>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`text-[#9a9490] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible backdrop to close menu on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-56 bg-[#0f0f0f] border border-[#2e2e2e] rounded-lg shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-150">
            <div className="px-4 py-3 border-b border-[#2e2e2e]">
              <p className="text-sm text-[#f5f0eb] font-medium truncate">
                {user?.given_name} {user?.family_name}
              </p>
              <p className="text-xs text-[#9a9490] truncate">{user?.email}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#9a9490] hover:bg-[#2e2e2e] hover:text-[#f5f0eb] transition-colors"
            >
              <Settings size={16} />
              Account Settings
            </Link>

            <LogoutLink className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 transition-colors w-full text-left">
              <LogOut size={16} />
              Sign Out
            </LogoutLink>
          </div>
        </>
      )}
    </div>
  );
}
