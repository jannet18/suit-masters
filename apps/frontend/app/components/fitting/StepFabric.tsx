// import { StepProps } from "@/lib/types";
// const colors: {
//   id: string;
//   label: string;
//   hex: string;
// }[] = [
//   {
//     id: "charcoal",
//     label: "Charcoal",
//     hex: "#3a3a3a",
//   },
//   {
//     id: "navy",
//     label: "Navy",
//     hex: "#1a2744",
//   },
//   {
//     id: "midnight",
//     label: "Midnight Blue",
//     hex: "#0d1b2a",
//   },
//   {
//     id: "black",
//     label: "Black",
//     hex: "#0f0f0f",
//   },
//   {
//     id: "grey",
//     label: "Mid Grey",
//     hex: "#6b6b6b",
//   },
//   {
//     id: "brown",
//     label: "Tobacco",
//     hex: "#6b4c2a",
//   },
//   {
//     id: "stone",
//     label: "Stone",
//     hex: "#c4b89a",
//   },
//   {
//     id: "cream",
//     label: "Ivory",
//     hex: "#f5f0eb",
//   },
// ];
// export function StepFabric({ data, onChange, product }: StepProps) {
//   const fabricGroup = product.customizationGroups?.find(
//     (g: any) => g.name === "Fabric",
//   );
//   return (
//     <div className="space-y-10">
//       {/* Fabric Selection */}
//       <div>
//         <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
//           Choose Your Fabric
//         </h3>
//         <div className="grid grid-cols-2 gap-4">
//           {fabricGroup?.options.map((opt: any, id: number) => {
//             // Map API fields to component expectations
//             const label = opt.name || opt.value || "";
//             const texture = opt.texture || "";
//             const origin = opt.metadata?.origin || opt.factoryCode || "";
//             const description = opt.metadata?.description || "";
//             const price = opt.priceDelta ? `+ £${opt.priceDelta}` : "";

import { StepProps } from "@/lib/types";
import { colors } from "../CustomTailoring";

//             return (
//               <button
//                 key={opt.id}
//                 onClick={() =>
//                   onChange({
//                     fabric: opt.value,
//                   })
//                 }
//                 className={`p-5 text-left border transition-all duration-200 ${data.fabric === opt.value ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e] hover:border-[#c9a96e]/50"}`}
//               >
//                 <div className="flex items-start gap-4">
//                   <div
//                     className={`w-12 h-12 shrink-0 ${texture} border border-[#ffffff]/10`}
//                   />
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2 mb-1">
//                       <div className="font-serif text-[#f5f0eb] text-sm font-semibold leading-snug">
//                         {label}
//                       </div>
//                       <span className="text-[#c9a96e] text-[11px] font-medium whitespace-nowrap">
//                         {price}
//                       </span>
//                     </div>
//                     <div className="text-[#9a9490] text-[10px] tracking-[0.15em] uppercase mb-2">
//                       {origin}
//                     </div>
//                     <div className="text-[#9a9490] text-[11px] leading-relaxed">
//                       {description}
//                     </div>
//                   </div>
//                 </div>
//                 {data.fabric === opt.value && (
//                   <div className="mt-3 pt-3 border-t border-[#c9a96e]/20 flex items-center gap-1.5">
//                     <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
//                     <span className="text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase">
//                       Selected
//                     </span>
//                   </div>
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Color Selection */}
//       <div>
//         <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
//           Select Colour
//         </h3>
//         <div className="flex flex-wrap gap-3">
//           {colors.map((c) => (
//             <button
//               key={c.id}
//               onClick={() =>
//                 onChange({
//                   fabricColor: c.id,
//                 })
//               }
//               title={c.label}
//               className={`group flex flex-col items-center gap-2 transition-all duration-200`}
//             >
//               <div
//                 className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${data.fabricColor === c.id ? "border-[#c9a96e] scale-110" : "border-[#2e2e2e] hover:border-[#9a9490]"}`}
//                 style={{
//                   backgroundColor: c.hex,
//                 }}
//               />
//               <span
//                 className={`text-[10px] transition-colors duration-200 ${data.fabricColor === c.id ? "text-[#c9a96e]" : "text-[#6b6560]"}`}
//               >
//                 {c.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
/* ==================== 2. FABRIC SELECTION STEP ==================== */
export function StepFabric({ data, onChange, product }: StepProps) {
  const fabricGroup = product.customizationGroups?.find(
    (g: any) => g.name === "Fabric"
  );

  return (
    <div className="space-y-10">
      {/* Fabric Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
          Choose Your Fabric
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fabricGroup?.options.map((opt: any) => {
            const label = opt.name || opt.value || "";
            const texture = opt.texture || "";
            const origin = opt.metadata?.origin || opt.factoryCode || "";
            const description = opt.metadata?.description || "";
            const priceVal = Number(opt.priceDelta || opt.price_delta || 0);
            const price = priceVal > 0 ? `+ £${priceVal.toFixed(2)}` : "";

            return (
              <button
                key={opt.id}
                onClick={() => onChange({ fabric: opt.value })}
                className={`p-5 text-left border transition-all duration-200 ${
                  data.fabric === opt.value 
                    ? "border-[#c9a96e] bg-[#c9a96e]/8" 
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 shrink-0 ${texture} bg-zinc-800 border border-[#ffffff]/10 rounded`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-serif text-[#f5f0eb] text-sm font-semibold leading-snug truncate">
                        {label}
                      </div>
                      <span className="text-[#c9a96e] text-[11px] font-medium whitespace-nowrap">
                        {price}
                      </span>
                    </div>
                    {origin && (
                      <div className="text-[#9a9490] text-[10px] tracking-[0.15em] uppercase mb-2">
                        {origin}
                      </div>
                    )}
                    {description && (
                      <div className="text-[#9a9490] text-[11px] leading-relaxed line-clamp-2">
                        {description}
                      </div>
                    )}
                  </div>
                </div>
                {data.fabric === opt.value && (
                  <div className="mt-3 pt-3 border-t border-[#c9a96e]/20 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
                    <span className="text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase">
                      Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
          Select Colour
        </h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ fabricColor: c.id })}
              title={c.label}
              className="group flex flex-col items-center gap-2 transition-all duration-200"
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                  data.fabricColor === c.id 
                    ? "border-[#c9a96e] scale-110" 
                    : "border-[#2e2e2e] hover:border-[#9a9490]"
                }`}
                style={{ backgroundColor: c.hex }}
              />
              <span
                className={`text-[10px] transition-colors duration-200 ${
                  data.fabricColor === c.id ? "text-[#c9a96e]" : "text-[#6b6560]"
                }`}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

