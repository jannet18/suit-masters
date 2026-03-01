"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ScissorsIcon,
  TruckIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react";
export function USPStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-60px",
  });
  return (
    <section ref={ref} className="border-y border-[#2e2e2e] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Item 1 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: 0,
            }}
            className="flex items-start gap-5 py-10 px-6 border-b sm:border-b-0 sm:border-r border-[#2e2e2e] lg:border-r"
          >
            <div className="shrink-0 w-10 h-10 border border-[#c9a96e]/40 flex items-center justify-center">
              <ScissorsIcon size={18} className="text-[#c9a96e]" />
            </div>
            <div>
              <h3 className="font-serif text-[#f5f0eb] text-base font-semibold mb-1">
                Made to Measure
              </h3>
              <p className="text-[#9a9490] text-sm leading-relaxed">
                Every suit cut to your exact measurements for a perfect fit.
              </p>
            </div>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="flex items-start gap-5 py-10 px-6 border-b sm:border-b-0 sm:border-r border-[#2e2e2e] lg:border-r"
          >
            <div className="shrink-0 w-10 h-10 border border-[#c9a96e]/40 flex items-center justify-center">
              <TruckIcon size={18} className="text-[#c9a96e]" />
            </div>
            <div>
              <h3 className="font-serif text-[#f5f0eb] text-base font-semibold mb-1">
                14-Day Delivery
              </h3>
              <p className="text-[#9a9490] text-sm leading-relaxed">
                Express tailoring with complimentary worldwide shipping.
              </p>
            </div>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="flex items-start gap-5 py-10 px-6 border-b lg:border-b-0 border-[#2e2e2e] lg:border-r"
          >
            <div className="shrink-0 w-10 h-10 border border-[#c9a96e]/40 flex items-center justify-center">
              <RefreshCwIcon size={18} className="text-[#c9a96e]" />
            </div>
            <div>
              <h3 className="font-serif text-[#f5f0eb] text-base font-semibold mb-1">
                Free Alterations
              </h3>
              <p className="text-[#9a9490] text-sm leading-relaxed">
                Complimentary adjustments within 30 days of delivery.
              </p>
            </div>
          </motion.div>

          {/* Item 4 */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={
              inView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {}
            }
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            className="flex items-start gap-5 py-10 px-6"
          >
            <div className="shrink-0 w-10 h-10 border border-[#c9a96e]/40 flex items-center justify-center">
              <ShieldCheckIcon size={18} className="text-[#c9a96e]" />
            </div>
            <div>
              <h3 className="font-serif text-[#f5f0eb] text-base font-semibold mb-1">
                Lifetime Guarantee
              </h3>
              <p className="text-[#9a9490] text-sm leading-relaxed">
                We stand behind every stitch with our lifetime warranty.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
