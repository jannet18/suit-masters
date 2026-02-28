"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "lucide-react";
export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-80px",
  });
  const [active, setActive] = useState(0);
  const testimonials = [
    {
      quote:
        "The Mayfair suit transformed how I walk into a boardroom. The fit is extraordinary — I've never felt more confident. Worth every penny.",
      author: "James Whitfield",
      title: "Managing Director, Whitfield & Co.",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80&fit=crop&crop=face",
      rating: 5,
    },
    {
      quote:
        "I've worn bespoke suits from Savile Row. Elevé matches that quality at a fraction of the price. The attention to detail is remarkable.",
      author: "Alexander Chen",
      title: "Partner, Chen Capital",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&fit=crop&crop=face",
      rating: 5,
    },
    {
      quote:
        "Ordered the Chelsea tuxedo for my wedding. Every guest asked where I got it. The craftsmanship is simply unmatched at this price point.",
      author: "Marcus Okafor",
      title: "Creative Director",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&fit=crop&crop=face",
      rating: 5,
    },
  ];
  const prev = () =>
    setActive((a) => (a - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((a) => (a + 1) % testimonials.length);
  return (
    <section ref={ref} className="py-24 bg-[#1a1a1a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
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
          className="text-center mb-16"
        >
          <p className="text-[#c9a96e] text-xs tracking-[0.3em] uppercase mb-4">
            Client Stories
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0eb] font-bold">
            Worn with Confidence
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.5,
              }}
              className="text-center"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({
                  length: testimonials[active].rating,
                }).map((_, i) => (
                  <StarIcon
                    key={i}
                    size={16}
                    className="fill-[#c9a96e] text-[#c9a96e]"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif text-xl md:text-2xl text-[#f5f0eb] leading-relaxed mb-10 font-medium italic">
                "{testimonials[active].quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[active].avatar}
                  alt={testimonials[active].author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#c9a96e]/30"
                />
                <div className="text-left">
                  <div className="text-[#f5f0eb] text-sm font-semibold">
                    {testimonials[active].author}
                  </div>
                  <div className="text-[#9a9490] text-xs tracking-wide">
                    {testimonials[active].title}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-10 h-10 border border-[#2e2e2e] flex items-center justify-center text-[#9a9490] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200"
            >
              <ChevronLeftIcon size={16} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`transition-all duration-300 ${i === active ? "w-8 h-1 bg-[#c9a96e]" : "w-4 h-1 bg-[#2e2e2e] hover:bg-[#9a9490]"}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-10 h-10 border border-[#2e2e2e] flex items-center justify-center text-[#9a9490] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
