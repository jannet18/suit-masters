import { CheckIcon } from "lucide-react";
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
    // basePrice: number;
    // totalPrice: number;
  };
}
interface StepProps {
  data: FittingData;
  basePrice: number;
  totalPrice: number;
  onChange: (updates: Partial<FittingData>) => void;
}
const fabricPrices: Record<string, number> = {
  wool: 0,
  cashmere: 180,
  linen: 60,
  tweed: 90,
};
const fabricLabels: Record<string, string> = {
  wool: "Super 120s Wool",
  cashmere: "Cashmere Blend",
  linen: "Irish Linen",
  tweed: "Harris Tweed",
};
const styleLabels: Record<string, string> = {
  single: "Single Breasted",
  double: "Double Breasted",
  tuxedo: "Tuxedo",
};
const fitLabels: Record<string, string> = {
  slim: "Slim Fit",
  regular: "Regular Fit",
  relaxed: "Relaxed Fit",
};
const lapelLabels: Record<string, string> = {
  notch: "Notch Lapel",
  peak: "Peak Lapel",
  shawl: "Shawl Lapel",
};
const colorLabels: Record<string, string> = {
  charcoal: "Charcoal",
  navy: "Navy",
  midnight: "Midnight Blue",
  black: "Black",
  grey: "Mid Grey",
  brown: "Tobacco",
  stone: "Stone",
  cream: "Ivory",
};
const colorHex: Record<string, string> = {
  charcoal: "#3a3a3a",
  navy: "#1a2744",
  midnight: "#0d1b2a",
  black: "#0f0f0f",
  grey: "#6b6b6b",
  brown: "#6b4c2a",
  stone: "#c4b89a",
  cream: "#f5f0eb",
};
export function StepSummary({ data, basePrice, totalPrice }: StepProps) {
  // const basePrice = 695;
  // const fabricExtra = fabricPrices[data.fabric] || 0;
  // const totalPrice = basePrice + fabricExtra;
  const measurementsFilled = Object.values(data.measurements).filter(
    Boolean,
  ).length;
  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="text-center pb-6 border-b border-[#2e2e2e]">
        <div className="inline-flex items-center justify-center w-12 h-12 border border-[#c9a96e]/40 mb-4">
          <CheckIcon size={20} className="text-[#c9a96e]" />
        </div>
        <h3 className="font-serif text-[#f5f0eb] text-xl font-bold mb-1">
          Your Bespoke Suit
        </h3>
        <p className="text-[#9a9490] text-sm">
          Review your selections before we begin crafting
        </p>
      </div>

      {/* Selections Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Style */}
        <div className="p-4 border border-[#2e2e2e] bg-[#1a1a1a]">
          <div className="text-[#9a9490] text-[9px] tracking-[0.3em] uppercase mb-2">
            Style
          </div>
          <div className="font-serif text-[#f5f0eb] text-sm">
            {styleLabels[data.style] || (
              <span className="text-[#6b6560] italic">Not selected</span>
            )}
          </div>
          {data.fit && (
            <div className="text-[#9a9490] text-xs mt-1">
              {fitLabels[data.fit]}
            </div>
          )}
        </div>

        {/* Fabric */}
        <div className="p-4 border border-[#2e2e2e] bg-[#1a1a1a]">
          <div className="text-[#9a9490] text-[9px] tracking-[0.3em] uppercase mb-2">
            Fabric
          </div>
          <div className="flex items-center gap-2">
            {data.fabricColor && (
              <div
                className="w-4 h-4 rounded-full border border-[#2e2e2e] shrink-0"
                style={{
                  backgroundColor: colorHex[data.fabricColor],
                }}
              />
            )}
            <div className="font-serif text-[#f5f0eb] text-sm">
              {fabricLabels[data.fabric] || (
                <span className="text-[#6b6560] italic">Not selected</span>
              )}
            </div>
          </div>
          {data.fabricColor && (
            <div className="text-[#9a9490] text-xs mt-1">
              {colorLabels[data.fabricColor]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 border border-[#2e2e2e] bg-[#1a1a1a]">
          <div className="text-[#9a9490] text-[9px] tracking-[0.3em] uppercase mb-2">
            Details
          </div>
          <div className="font-serif text-[#f5f0eb] text-sm">
            {lapelLabels[data.lapel] || (
              <span className="text-[#6b6560] italic">Not selected</span>
            )}
          </div>
          {data.buttons && (
            <div className="text-[#9a9490] text-xs mt-1">
              {data.buttons} Button
            </div>
          )}
        </div>

        {/* Measurements */}
        <div className="p-4 border border-[#2e2e2e] bg-[#1a1a1a]">
          <div className="text-[#9a9490] text-[9px] tracking-[0.3em] uppercase mb-2">
            Measurements
          </div>
          <div className="font-serif text-[#f5f0eb] text-sm">
            {measurementsFilled} / 6 entered
          </div>
          <div className="mt-1.5 flex gap-1">
            {Array.from({
              length: 6,
            }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 ${i < measurementsFilled ? "bg-[#c9a96e]" : "bg-[#2e2e2e]"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border border-[#2e2e2e] bg-[#1a1a1a]">
        <div className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#9a9490]">Base price</span>
            <span className="text-[#f5f0eb]">£{basePrice}</span>
          </div>
          {/* {fabricExtra > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#9a9490]">
                Fabric upgrade ({fabricLabels[data.fabric]})
              </span>
              <span className="text-[#f5f0eb]">+£{fabricExtra}</span>
            </div>
          )} */}
          <div className="flex justify-between text-sm">
            <span className="text-[#9a9490]">Made to measure</span>
            <span className="text-[#c9a96e]">Included</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#9a9490]">Worldwide delivery</span>
            <span className="text-[#c9a96e]">Included</span>
          </div>
        </div>
        <div className="flex justify-between items-center px-5 py-4 border-t border-[#2e2e2e]">
          <span className="font-serif text-[#f5f0eb] text-base font-semibold">
            Total
          </span>
          <span className="font-serif text-[#c9a96e] text-2xl font-bold">
            £{totalPrice}
          </span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="flex items-center gap-3 text-[#9a9490] text-xs">
        <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full shrink-0" />
        Estimated delivery: 14–18 working days after order confirmation
      </div>
    </div>
  );
}
