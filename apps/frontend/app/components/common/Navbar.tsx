"use client";

import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  SearchIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  ScissorsIcon,
  User,
} from "lucide-react";
import SearchBar from "./SearchBar";
import UserButton from "./UserButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: any;
  onOpenFitting?: () => void;
  activeProductSlug?: string | null;
  slug?: string;
}
export function Navbar({
  user,
  onOpenFitting,
  activeProductSlug,
  slug,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // const [cartCount] = useState(2);
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigateToConfigure = ({
    user,
    activeProductSlug,
  }: NavbarProps) => {
    setMenuOpen(false);
    if (activeProductSlug) {
      router.push(`/products/${activeProductSlug}/configure`);
    } else {
      // Redirect to the /configure page which will dynamically
      // redirect to an available product
      router.push("/configure");
    }
  };
  return (
    <>
      <motion.header
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut",
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0f0f0f]/95 backdrop-blur-md border-b border-[#2e2e2e]" : "bg-transparent"}`}
      >
        <div className="flex flex-col max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-center">
              <a href="/" className="flex flex-col items-center">
                <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#f5f0eb]">
                  Suit Masters
                </span>
                <span className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mt-0.5">
                  Bespoke Tailoring
                </span>
              </a>
            </div>
            {/* Left Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <a
                href="/collection/suits"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Suits
              </a>
              <a
                href="/collection/blazers"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Blazers
              </a>
              <a
                href="/collection/shirts"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Shirts
              </a>
              <button
                onClick={(e) =>
                  handleNavigateToConfigure({ user, activeProductSlug })
                }
                className="text-[#c9a96e] hover:text-[#dfc08a] text-xs tracking-[0.2em] uppercase font-semibold transition-colors duration-200 flex items-center gap-1.5"
              >
                <ScissorsIcon size={12} />
                Custom Fitting
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              <button
                aria-label="Account"
                className="hidden lg:flex text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                {!user ? (
                  <Link
                    href="/api/auth/login"
                    className="text-gray-400 hover:text-white "
                  >
                    <User size={18} />
                  </Link>
                ) : (
                  <UserButton user={user} />
                )}
              </button>
              <Link
                href="/cart"
                className="relative text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <ShoppingBagIcon size={18} className="cursor-pointer" />
              </Link>
              <button
                aria-label="Toggle menu"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-[#9a9490] hover:text-[#f5f0eb] transition-colors duration-200"
              >
                {menuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center m-2">
            <Suspense
              fallback={
                <div className="w-40 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              }
            >
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              x: "100%",
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: "100%",
            }}
            transition={{
              duration: 0.35,
              ease: "easeInOut",
            }}
            className="fixed inset-0 z-40 bg-[#0f0f0f] flex flex-col pt-24 px-8"
          >
            <nav className="flex flex-col gap-6">
              {[
                "Suits",
                "Blazers",
                "Shirts",
                "Trousers",
                "Accessories",
                "Sale",
              ].map((item, i) => (
                <Link
                  key={item}
                  href={`/collection/${item.toLocaleLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-3xl text-[#f5f0eb] hover:text-[#c9a96e] transition-colors duration-200 border-b border-[#2e2e2e] pb-4"
                >
                  {item}
                </Link>
              ))}
              <motion.button
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 6 * 0.07,
                }}
                onClick={(e) =>
                  handleNavigateToConfigure({ user, activeProductSlug })
                }
                className="font-serif text-3xl text-[#c9a96e] hover:text-[#dfc08a] transition-colors duration-200 border-b border-[#2e2e2e] pb-4 text-left flex items-center gap-3"
              >
                <ScissorsIcon size={24} />
                Custom Fitting
              </motion.button>
            </nav>
            <div className="mt-auto pb-10 flex gap-6">
              <button className="text-[#9a9490] hover:text-[#c9a96e] transition-colors">
                <SearchIcon size={20} />
              </button>
              <button className="text-[#9a9490] hover:text-[#c9a96e] transition-colors">
                <UserIcon size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
