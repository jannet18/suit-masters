"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  onOpenFitting?: () => void;
}
export function HeroSection({ onOpenFitting }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const router = useRouter();
  return (
    <section
      ref={ref}
      className="relative h-screen min-h-175 overflow-hidden bg-[#0f0f0f]"
    >
      {}
      {/* Parallax Background */}
      <motion.div
        style={{
          y,
        }}
        className="absolute inset-0 scale-110"
      >
        <img
          src="https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=1800&q=85&fit=crop"
          alt=""
          className="w-full h-full object-cover object-top"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0f0f0f]/95 via-[#0f0f0f]/60 to-[#0f0f0f]/20" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/80 via-transparent to-transparent" />
      </motion.div>
      {}
      {/* Content */}
      <motion.div
        style={{
          opacity,
        }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.2,
              }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-px w-10 bg-[#c9a96e]" />
              <span className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase font-medium">
                New Collection 2026
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.35,
              }}
              className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-[#f5f0eb] leading-[0.95] mb-6"
            >
              Dressed
              <br />
              <em className="text-[#c9a96e] not-italic">for Power.</em>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.5,
              }}
              className="text-[#9a9490] text-base md:text-lg leading-relaxed mb-10 max-w-sm font-light"
            >
              Precision-cut suits crafted from the world's finest wools.
              Tailored to your exact measurements — delivered in 14 days.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.65,
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/collections"
                className="group inline-flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#dfc08a] transition-colors duration-300"
              >
                Shop Collection
                <ArrowRightIcon
                  size={14}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </Link>
              {onOpenFitting ? (
                  <button
                  onClick={onOpenFitting}
                  type="button"
                  className="inline-flex items-center justify-center gap-3 border border-[#f5f0eb]/30 bg-transparent text-[#f5f0eb] px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300 cursor-pointer"
                >Book a Fitting</button>
              ) : (
              <Link
                href="/lifestyle"
                className="inline-flex items-center gap-3 border border-[#f5f0eb]/30 text-[#f5f0eb] px-8 py-4 text-xs tracking-[0.2em] uppercase font-semibold hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-300"
              >
                Book a Fitting
              </Link>
            )}
            </motion.div>
          </div>
        </div>
      </motion.div>
{}
      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 1.2,
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#9a9490] text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="w-px h-8 bg-linear-to-b from-[#c9a96e] to-transparent"
        />
      </motion.div>

      {/* Side Stats */}
      <motion.div
        initial={{
          opacity: 0,
          x: 20,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.7,
          delay: 0.9,
        }}
        className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-8"
      >
        <div className="text-right">
          <div className="font-serif text-3xl text-[#f5f0eb] font-bold">
            200+
          </div>
          <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
            Fabrics
          </div>
        </div>
        <div className="w-px h-12 bg-[#2e2e2e] ml-auto" />
        <div className="text-right">
          <div className="font-serif text-3xl text-[#f5f0eb] font-bold">14</div>
          <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
            Day Delivery
          </div>
        </div>
        <div className="w-px h-12 bg-[#2e2e2e] ml-auto" />
        <div className="text-right">
          <div className="font-serif text-3xl text-[#f5f0eb] font-bold">
            50k+
          </div>
          <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
            Clients
          </div>
        </div>
      </motion.div>
    </section>
  );
}
