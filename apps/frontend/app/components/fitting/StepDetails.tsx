import React from "react";
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
const lapels = [
  {
    id: "notch",
    label: "Notch Lapel",
    description: "The most versatile. Suits every occasion.",
    svg: (
      <svg viewBox="0 0 60 80" fill="none" className="w-12 h-16">
        <path
          d="M30 10 L10 30 L20 40 L30 35 L40 40 L50 30 Z"
          stroke="#c9a96e"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M20 40 L15 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path
          d="M40 40 L45 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path d="M15 70 L45 70" stroke="#9a9490" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "peak",
    label: "Peak Lapel",
    description: "Bold and distinguished. A power statement.",
    svg: (
      <svg viewBox="0 0 60 80" fill="none" className="w-12 h-16">
        <path
          d="M30 10 L5 25 L15 45 L30 38 L45 45 L55 25 Z"
          stroke="#c9a96e"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M15 45 L12 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path
          d="M45 45 L48 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path d="M12 70 L48 70" stroke="#9a9490" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "shawl",
    label: "Shawl Lapel",
    description: "Elegant and rounded. Perfect for evening wear.",
    svg: (
      <svg viewBox="0 0 60 80" fill="none" className="w-12 h-16">
        <path
          d="M30 10 Q8 30 15 50 L30 42 L45 50 Q52 30 30 10Z"
          stroke="#c9a96e"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M15 50 L13 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path
          d="M45 50 L47 70"
          stroke="#9a9490"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <path d="M13 70 L47 70" stroke="#9a9490" strokeWidth="1" />
      </svg>
    ),
  },
];
const linings = [
  {
    id: "ivory",
    label: "Ivory",
    hex: "#f5f0eb",
  },
  {
    id: "burgundy",
    label: "Burgundy",
    hex: "#6b1a2a",
  },
  {
    id: "navy",
    label: "Navy",
    hex: "#1a2744",
  },
  {
    id: "gold",
    label: "Gold",
    hex: "#c9a96e",
  },
  {
    id: "black",
    label: "Black",
    hex: "#1a1a1a",
  },
  {
    id: "stripe",
    label: "Stripe",
    hex: "#3a3a5a",
  },
];
const buttonOptions = [
  {
    id: "1",
    label: "1 Button",
    desc: "Sleek and modern",
  },
  {
    id: "2",
    label: "2 Button",
    desc: "Classic standard",
  },
  {
    id: "3",
    label: "3 Button",
    desc: "Traditional English",
  },
];
export function StepDetails({ data, onChange }: StepProps) {
  return (
    <div className="space-y-10">
      {/* Lapel */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
          Lapel Style
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {lapels.map((l) => (
            <button
              key={l.id}
              onClick={() =>
                onChange({
                  lapel: l.id,
                })
              }
              className={`p-5 text-center border transition-all duration-200 flex flex-col items-center gap-3 ${data.lapel === l.id ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e] hover:border-[#c9a96e]/50"}`}
            >
              {l.svg}
              <div>
                <div className="font-serif text-[#f5f0eb] text-sm font-medium">
                  {l.label}
                </div>
                <div className="text-[#9a9490] text-[10px] mt-1 leading-snug">
                  {l.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
          Button Count
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {buttonOptions.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                onChange({
                  buttons: b.id,
                })
              }
              className={`p-4 text-center border transition-all duration-200 ${data.buttons === b.id ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e] hover:border-[#c9a96e]/50"}`}
            >
              <div className="font-serif text-[#f5f0eb] text-sm font-medium mb-1">
                {b.label}
              </div>
              <div className="text-[#9a9490] text-[11px]">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lining */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
          Lining Colour
        </h3>
        <div className="flex flex-wrap gap-3">
          {linings.map((l) => (
            <button
              key={l.id}
              onClick={() =>
                onChange({
                  lining: l.id,
                })
              }
              title={l.label}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${data.lining === l.id ? "border-[#c9a96e] scale-110" : "border-[#2e2e2e] hover:border-[#9a9490]"}`}
                style={{
                  backgroundColor: l.hex,
                }}
              />
              <span
                className={`text-[10px] transition-colors duration-200 ${data.lining === l.id ? "text-[#c9a96e]" : "text-[#6b6560]"}`}
              >
                {l.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
