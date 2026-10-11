"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const BENEFITS = [
  "Early access to new collections",
  "Exclusive member pricing",
  "Saved measurements & fittings",
  "Priority customer service",
];

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Show the member-benefits checklist on the brand panel (sign-up only). */
  showBenefits?: boolean;
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  showBenefits = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(201,169,110,0.05) 0px, rgba(201,169,110,0.05) 1px, transparent 1px, transparent 64px), radial-gradient(circle at 20% 20%, rgba(201,169,110,0.08), transparent 55%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-8"
        >
          {showBenefits ? (
            <ul className="space-y-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-center gap-3 text-[#f5f0eb]/90"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-[#c9a96e] text-[#c9a96e] text-xs">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-px w-16 bg-[#c9a96e]" />
          )}

          <blockquote className="font-serif text-3xl leading-snug text-[#f5f0eb]">
            &ldquo;The suit is the armour of the modern gentleman.&rdquo;
          </blockquote>
          <p className="text-xs tracking-[0.3em] text-[#9a9490] uppercase">
            — Suit Masters
          </p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <p className="text-[10px] tracking-[0.4em] text-[#c9a96e] uppercase mb-3">
            {eyebrow}
          </p>
          <h1 className="font-serif text-3xl text-[#f5f0eb] mb-2">{title}</h1>
          <p className="text-sm text-[#9a9490] mb-8">{subtitle}</p>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
