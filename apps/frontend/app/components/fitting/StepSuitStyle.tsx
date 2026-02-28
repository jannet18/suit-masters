import React from "react";
import { motion } from "framer-motion";
interface FittingData {
  style: string;
  fit: string;
  buttons: string;
  fabric: string;
  fabricColor: string;
  lapel: string;
  lining: string;
  buttonColor: string;
  measurements: {
    height: string;
    chest: string;
    waist: string;
    hips: string;
    inseam: string;
    shoulder: string;
  };
}
interface StepProps {
  data: FittingData;
  onChange: (updates: Partial<FittingData>) => void;
}
const styles = [
  {
    id: "single",
    label: "Single Breasted",
    description: "The classic choice. Versatile, modern, timeless.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80&fit=crop",
  },
  {
    id: "double",
    label: "Double Breasted",
    description: "Bold and authoritative. A statement of confidence.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80&fit=crop",
  },
  {
    id: "tuxedo",
    label: "Tuxedo",
    description: "For evenings that demand the extraordinary.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80&fit=crop",
  },
];
const fits = [
  {
    id: "slim",
    label: "Slim Fit",
    desc: "Close to the body, sharp silhouette",
  },
  {
    id: "regular",
    label: "Regular Fit",
    desc: "Classic proportions, comfortable ease",
  },
  {
    id: "relaxed",
    label: "Relaxed Fit",
    desc: "Generous cut, effortless drape",
  },
];
export function StepSuitStyle({ data, onChange }: StepProps) {
  return (
    <div className="space-y-10">
      {/* Style Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
          Choose Your Style
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                onChange({
                  style: s.id,
                })
              }
              className={`group relative overflow-hidden text-left transition-all duration-300 ${data.style === s.id ? "ring-2 ring-[#c9a96e]" : "ring-1 ring-[#2e2e2e] hover:ring-[#c9a96e]/50"}`}
            >
              <div className="aspect-3/4 overflow-hidden">
                <img
                  src={s.image}
                  alt={s.label}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/80 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="font-serif text-[#f5f0eb] text-sm font-semibold">
                  {s.label}
                </div>
                <div className="text-[#9a9490] text-[11px] mt-0.5 leading-snug">
                  {s.description}
                </div>
              </div>
              {data.style === s.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#c9a96e] rounded-full flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#0f0f0f"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fit Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
          Select Your Fit
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {fits.map((f) => (
            <button
              key={f.id}
              onClick={() =>
                onChange({
                  fit: f.id,
                })
              }
              className={`p-4 text-left border transition-all duration-200 ${data.fit === f.id ? "border-[#c9a96e] bg-[#c9a96e]/10" : "border-[#2e2e2e] hover:border-[#c9a96e]/50"}`}
            >
              <div className="font-serif text-[#f5f0eb] text-sm font-medium mb-1">
                {f.label}
              </div>
              <div className="text-[#9a9490] text-[11px] leading-snug">
                {f.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
