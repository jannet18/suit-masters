"use client";

import { useState, useEffect, Suspense } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  User,
  ScissorsIcon,
  UserIcon,
  XIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react";
import UserButton from "./UserButton";
import { useCartStore } from "@/app/stores/useCartStore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";

interface NavbarClientProps {
  user: any;
  onOpenFitting?: () => void;
}

export default function NavbarClient({
  user,
  onOpenFitting,
}: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { cart } = useCartStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // <header
    //   className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    //     scrolled ? "bg-black/90 backdrop-blur border-b" : "bg-transparent"
    //   }`}
    // >
    //   <div className="flex items-center justify-between h-20 max-w-7xl mx-auto px-6">
    //     {/* Logo */}
    //     <Link href="/" className="text-white font-bold text-xl">
    //       Suit Masters
    //     </Link>

    //     {/* Right Actions */}
    //     <div className="flex items-center gap-6">
    //       {/* User */}
    //       {!user ? (
    //         <Link
    //           href="/api/auth/login?post_login_redirect_url=/"
    //           className="text-gray-400 hover:text-white"
    //         >
    //           <User size={18} />
    //         </Link>
    //       ) : (
    //         <UserButton user={user} />
    //       )}

    //       {/* Cart */}
    //       <Link href="/cart" className="relative">
    //         <ShoppingBag size={18} className="text-gray-400" />
    //         {cartCount > 0 && (
    //           <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
    //             {cartCount}
    //           </span>
    //         )}
    //       </Link>

    //       {/* Mobile Menu */}
    //       <button onClick={() => setMenuOpen(!menuOpen)}>
    //         {menuOpen ? <X size={20} /> : <Menu size={20} />}
    //       </button>
    //     </div>
    //   </div>
    // </header>
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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? "bg-[#1a202c]/95 backdrop-blur-md border-b border-[#2e2e2e]" : "bg-transparent"}`}
      >
        <div className="flex flex-col max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-1 lg:flex-none flex justify-center lg:justify-center">
              <a href="#" className="flex flex-col items-center">
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
                href="#"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Suits
              </a>
              <a
                href="#"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Blazers
              </a>
              <a
                href="#"
                className="gold-underline text-[#9a9490] hover:text-[#f5f0eb] text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200"
              >
                Shirts
              </a>
              <button
                onClick={onOpenFitting}
                className="text-[#c9a96e] hover:text-[#dfc08a] text-xs tracking-[0.2em] uppercase font-semibold transition-colors duration-200 flex items-center gap-1.5"
              >
                <ScissorsIcon size={12} />
                Custom Fitting
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
              <button
                aria-label="Search"
                className="hidden lg:flex text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              ></button>
              <button
                aria-label="Account"
                className="hidden lg:flex text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                {!user ? (
                  <Link
                    href="/api/auth/login?post_login_redirect_url=/"
                    className="text-gray-400 hover:text-white"
                  >
                    <User size={18} />
                  </Link>
                ) : (
                  <UserButton user={user} />
                )}
              </button>
              <button
                // onClick={() => navigate("/cart")}
                aria-label={`Shopping bag, ${cartCount} items`}
                className="relative text-[#9a9490] hover:text-[#c9a96e] transition-colors duration-200"
              >
                <Link href="/cart" className="relative">
                  <ShoppingBag size={18} className="text-gray-400" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {/* <ShoppingBagIcon size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#c9a96e] text-[#0f0f0f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )} */}
              </button>
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
            className="fixed inset-0 z-40 bg-[#1a202c] flex flex-col pt-24 px-8"
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
                <motion.a
                  key={item}
                  href="#"
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: i * 0.07,
                  }}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-3xl text-[#f5f0eb] hover:text-[#c9a96e] transition-colors duration-200 border-b border-[#2e2e2e] pb-4"
                >
                  {item}
                </motion.a>
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
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFitting?.();
                }}
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
