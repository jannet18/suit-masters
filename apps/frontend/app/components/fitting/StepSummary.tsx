// "use client";

import { StepProps } from "@/lib/types";

// import { StepProps } from "@/lib/types";
// import { CheckIcon, Ruler, Scissors, Box, Globe } from "lucide-react";

// // Helper to map values to readable labels (keep your existing Record maps here)
// const fabricLabels: Record<string, string> = {
//   wool: "Super 120s Wool",
//   cashmere: "Cashmere Blend",
//   linen: "Irish Linen",
//   tweed: "Harris Tweed",
// };

// export function StepSummary({
//   data,
//   basePrice = 0,
//   totalPrice = 0,
//   product,
// }: StepProps) {
//   // Calculate the delta for the summary view
//   const totalSurcharges = (totalPrice || 0) - (basePrice || 0);

//   // Count filled measurements
//   const measurementKeys = [
//     "height",
//     "chest",
//     "waist",
//     "hips",
//     "inseam",
//     "shoulder",
//   ];
//   const filledCount = measurementKeys.filter(
//     (key) =>
//       data.measurements &&
//       data.measurements[key as keyof typeof data.measurements],
//   ).length;

//   return (
//     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
//       {/* 1. Header Section */}
//       <div className="text-center pb-8 border-b border-white/5">
//         <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 mb-4">
//           <CheckIcon size={24} className="text-[#c9a96e]" />
//         </div>
//         <h3 className="font-serif text-[#f5f0eb] text-2xl font-bold mb-2">
//           Final Review
//         </h3>
//         <p className="text-[#9a9490] text-sm font-light tracking-wide">
//           Please confirm your bespoke specifications below.
//         </p>
//       </div>

//       {/* 2. Selection Breakdown Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Design & Fit */}
//         <div className="group p-5 border border-white/5 bg-[#121212] hover:border-[#c9a96e]/30 transition-colors">
//           <div className="flex items-center gap-2 mb-3">
//             <Scissors size={14} className="text-[#c9a96e]" />
//             <span className="text-[#9a9490] text-[10px] tracking-[0.3em] uppercase">
//               Silhouette
//             </span>
//           </div>
//           <p className="font-serif text-[#f5f0eb] text-lg capitalize">
//             {data.style || "Classic"} {product?.name || "Suit"}
//           </p>
//           <p className="text-[#6b6560] text-xs mt-1 uppercase tracking-widest">
//             {data.fit || "Regular"} Fit • {data.lapel || "Notch"} Lapel
//           </p>
//         </div>

//         {/* Material & Color */}
//         <div className="group p-5 border border-white/5 bg-[#121212] hover:border-[#c9a96e]/30 transition-colors">
//           <div className="flex items-center gap-2 mb-3">
//             <Box size={14} className="text-[#c9a96e]" />
//             <span className="text-[#9a9490] text-[10px] tracking-[0.3em] uppercase">
//               Material Selection
//             </span>
//           </div>
//           <div className="flex items-center gap-3">
//             {data.fabricColor && (
//               <div
//                 className="w-4 h-4 rounded-full border border-white/10"
//                 style={{ backgroundColor: data.fabricColor }}
//               />
//             )}
//             <p className="font-serif text-[#f5f0eb] text-lg">
//               {data.fabric || "Premium Wool"}
//             </p>
//           </div>
//           <p className="text-[#6b6560] text-xs mt-1 uppercase tracking-widest">
//             Premium {data.lining || "Signature"}
//           </p>
//         </div>
//       </div>

//       {/* 3. Measurement Progress Card */}
//       <div className="p-6 border border-white/5 bg-[#121212]">
//         <div className="flex justify-between items-end mb-4">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <Ruler size={14} className="text-[#c9a96e]" />
//               <span className="text-[#9a9490] text-[10px] tracking-[0.3em] uppercase">
//                 Anatomical Data
//               </span>
//             </div>
//             <p className="font-serif text-[#f5f0eb] text-lg">
//               Personal Measurement Profile
//             </p>
//           </div>
//           <span className="text-[#c9a96e] text-xs font-mono">
//             {filledCount}/6 Metrics
//           </span>
//         </div>

//         {/* Progress bar */}
//         <div className="h-1 w-full bg-white/5 flex gap-1">
//           {measurementKeys.map((key, i) => {
//             const isFilled =
//               data.measurements[key as keyof typeof data.measurements];
//             return (
//               <div
//                 key={key}
//                 className={`h-full flex-1 transition-all duration-500 ${isFilled ? "bg-[#c9a96e]" : "bg-white/10"}`}
//               />
//             );
//           })}
//         </div>
//       </div>

//       {/* 4. Final Pricing & Logistics */}
//       <div className="border border-white/5 bg-[#151515] overflow-hidden rounded-sm">
//         <div className="p-6 space-y-4">
//           <div className="flex justify-between text-sm">
//             <span className="text-[#9a9490]">Base Tailoring</span>
//             <span className="text-[#f5f0eb]">
//               £{(basePrice || 0).toFixed(2)}
//             </span>
//           </div>

//           {totalSurcharges > 0 && (
//             <div className="flex justify-between text-sm">
//               <span className="text-[#9a9490]">
//                 Premium Upgrades (Fabric/Style)
//               </span>
//               <span className="text-[#f5f0eb]">
//                 +£{totalSurcharges.toFixed(2)}
//               </span>
//             </div>
//           )}

//           <div className="flex justify-between text-sm">
//             <div className="flex items-center gap-2">
//               <Globe size={12} className="text-[#c9a96e]" />
//               <span className="text-[#9a9490]">Insured Global Shipping</span>
//             </div>
//             <span className="text-[#c9a96e] uppercase text-[10px] font-bold">
//               Complimentary
//             </span>
//           </div>
//         </div>

//         <div className="flex justify-between items-center px-6 py-5 bg-white/5">
//           <div>
//             <p className="text-[#f5f0eb] font-serif text-lg font-medium">
//               Total Investment
//             </p>
//             <p className="text-[#6b6560] text-[9px] uppercase tracking-widest italic">
//               Final Price (VAT Incl.)
//             </p>
//           </div>
//           <span className="font-serif text-[#c9a96e] text-3xl font-bold">
//             £{(totalPrice || 0).toFixed(2)}
//           </span>
//         </div>
//       </div>

//       {/* 5. Production Disclaimer */}
//       <div className="flex items-start gap-3 p-4 bg-[#c9a96e]/5 border border-[#c9a96e]/10">
//         <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full mt-1.5 shrink-0" />
//         <p className="text-[#9a9490] text-[11px] leading-relaxed italic">
//           Production commences <span className="text-[#c9a96e]">24 hours</span>
//           after order placement. By adding to wardrobe, you confirm these unique
//           specifications are correct for your commission.
//         </p>
//       </div>
//     </div>
//   );
// }
/* ==================== 5. ORDER SUMMARY STEP ==================== */
export function StepSummary({ data, totalPrice, product }: StepProps) {
  // Compute individual upgrades/deltas
  const getUpgradeDetails = () => {
    const items = [];
    
    if (data.style) {
      items.push({ label: "Design Silhouette Style", val: data.style });
    }
    if (data.fabric) {
      items.push({ label: "Bespoke Outer Fabric", val: `${data.fabric} (${data.fabricColor || "Default"})` });
    }
    if (data.lapel) {
      items.push({ label: "Internal Lapel Structuring", val: data.lapel });
    }
    if (data.lining) {
      items.push({ label: "Sartorial Body Lining", val: data.lining });
    }
    if (data.buttons) {
      items.push({ label: "Front Sleeve Button Set", val: `${data.buttons} Button Set` });
    }
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-white/5 rounded-lg p-6 divide-y divide-white/5">
        <h3 className="font-serif font-bold text-lg pb-4 text-[#f5f0eb]">Bespoke Technical Specifications</h3>
        
        <div className="py-4 space-y-3 text-xs">
          {getUpgradeDetails().map((item, idx) => (
            <div key={idx} className="flex justify-between items-baseline gap-4 py-0.5">
              <span className="text-zinc-500">{item.label}</span>
              <span className="text-[#f5f0eb] font-mono">{item.val}</span>
            </div>
          ))}
        </div>

        <div className="py-4 space-y-2 text-xs">
          <div className="flex justify-between text-[#9a9490]">
            <span>Physiological Sizing Measurements</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#c9a96e]">
              Locked to Account
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded font-mono text-zinc-400 text-[10px]">
            <div>Height: {data.measurements.height} {data.measurements.unit}</div>
            <div>Chest: {data.measurements.chest} {data.measurements.unit}</div>
            <div>Waist: {data.measurements.waist} {data.measurements.unit}</div>
            <div>Hips: {data.measurements.hips} {data.measurements.unit}</div>
            <div>Inseam: {data.measurements.inseam} {data.measurements.unit}</div>
            <div>Shoulder: {data.measurements.shoulder} {data.measurements.unit}</div>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-baseline">
          <span className="font-bold text-sm text-[#f5f0eb] uppercase tracking-wider">Total Investment</span>
             <span className="font-mono text-3xl font-bold text-[#c9a96e]">
               £ {(totalPrice ?? 0).toFixed(2)}
             </span>
        </div>
      </div>
    </div>
  );
}