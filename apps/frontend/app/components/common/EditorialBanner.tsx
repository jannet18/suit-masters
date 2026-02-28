"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
interface EditorialBannerProps {
  onOpenFitting?: () => void;
}
export function EditorialBanner({ onOpenFitting }: EditorialBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-100px",
  });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  return (
    <section ref={ref} className="py-24 bg-[#1a202c]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Image Side */}
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    x: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.9,
              ease: "easeOut",
            }}
            className="relative overflow-hidden aspect-4/5 lg:aspect-auto lg:min-h-150"
          >
            <motion.img
              style={{
                y,
              }}
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80&fit=crop"
              alt="Editorial suit photography"
              className="w-full h-full object-cover object-center scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]/30" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    x: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.9,
              ease: "easeOut",
              delay: 0.15,
            }}
            className="bg-[#1a1a1a] flex flex-col justify-center px-10 md:px-16 py-16 lg:py-0"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[#c9a96e]" />
              <span className="text-[#c9a96e] text-[10px] tracking-[0.35em] uppercase">
                The Craft
              </span>
            </div>

            <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold leading-tight mb-6">
              Tailored to
              <br />
              <em className="text-[#c9a96e] not-italic">Your Story</em>
            </h2>

            <p className="text-[#9a9490] text-base leading-relaxed mb-6 font-light">
              Every suit begins with a conversation. Our master tailors take
              over 30 measurements to understand not just your body, but how you
              move, how you sit, how you command a room.
            </p>

            <p className="text-[#9a9490] text-base leading-relaxed mb-10 font-light">
              From the finest Super 150s wool to hand-stitched lapels — each
              piece is a testament to the art of bespoke tailoring.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 py-8 border-y border-[#2e2e2e]">
              <div>
                <div className="font-serif text-3xl text-[#f5f0eb] font-bold">
                  30+
                </div>
                <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
                  Measurements
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl text-[#f5f0eb] font-bold">
                  48h
                </div>
                <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
                  Fitting Time
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl text-[#f5f0eb] font-bold">
                  100%
                </div>
                <div className="text-[#9a9490] text-[10px] tracking-[0.2em] uppercase mt-1">
                  Satisfaction
                </div>
              </div>
            </div>

            <button
              onClick={onOpenFitting}
              className="group inline-flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-4 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300 w-fit"
            >
              Start Your Fitting
              <ArrowRightIcon
                size={14}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
