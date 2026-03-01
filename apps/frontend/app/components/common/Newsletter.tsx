"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";
export function Newsletter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-80px",
  });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };
  return (
    <section ref={ref} className="relative py-28 bg-[#0f0f0f] overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1800&q=30&fit=crop"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-[#0f0f0f]/60 via-transparent to-[#0f0f0f]/60" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
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
            duration: 0.7,
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#c9a96e]" />
            <span className="text-[#c9a96e] text-[10px] tracking-[0.35em] uppercase">
              Private Access
            </span>
            <div className="h-px w-10 bg-[#c9a96e]" />
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold mb-4 leading-tight">
            Join the Inner Circle
          </h2>

          <p className="text-[#9a9490] text-base leading-relaxed mb-10 font-light">
            Be the first to access new collections, private sales, and exclusive
            invitations to our trunk shows. Members receive 15% off their first
            order.
          </p>

          {submitted ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="py-6"
            >
              <div className="text-[#c9a96e] font-serif text-2xl mb-2">
                Welcome to Elevé.
              </div>
              <p className="text-[#9a9490] text-sm">
                Check your inbox for your exclusive welcome offer.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
            >
              <div
                className={`flex-1 border transition-colors duration-200 ${focused ? "border-[#c9a96e]" : "border-[#2e2e2e]"}`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Your email address"
                  required
                  aria-label="Email address"
                  className="w-full bg-transparent text-[#f5f0eb] placeholder-[#6b6560] px-5 py-4 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="group bg-[#c9a96e] text-[#0f0f0f] px-7 py-4 text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Subscribe
                <ArrowRightIcon
                  size={12}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </button>
            </form>
          )}

          <p className="text-[#6b6560] text-xs mt-5">
            No spam, ever. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
