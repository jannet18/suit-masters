// import { StepProps } from "@/lib/types";
// export function StepDetails({
//   data,
//   onChange,
//   product,
// }: StepProps & { product: any }) {
//   const lapelGroup = product.customizationGroups.find((g: any) =>
//     g.name.toLowerCase().includes("lapel"),
//   );
//   const buttonGroup = product.customizationGroups.find((g: any) =>
//     g.name.toLowerCase().includes("button"),
//   );
//   const liningGroup = product.customizationGroups.find((g: any) =>
//     g.name.toLowerCase().includes("lining"),
//   );
//   return (
//     <div className="space-y-10">
//       {/* Lapel */}
//       {lapelGroup && (
//         <div>
//           <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
//             {lapelGroup.name}
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             {lapelGroup.options.map((l: any) => (
//               <button
//                 key={l.id}
//                 onClick={() => onChange({ lapel: l.value })}
//                 className={`p-5 text-center border transition-all ${data.lapel === l.value ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e]"}`}
//               >
//                 {/* Fallback to your beautiful SVGs based on value name */}
//                 <div className="font-serif text-[#f5f0eb] text-sm font-medium">
//                   {l.value}
//                 </div>
//                 <div className="text-[#c9a96e] text-[10px] mt-1">
//                   + £{l.price_delta}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* lining */}
//       {liningGroup && (
//         <div>
//           <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
//             {liningGroup.name}
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             {liningGroup.options.map((l: any) => (
//               <button
//                 key={l.id}
//                 onClick={() => onChange({ lining: l.value })}
//                 className={`p-5 text-center border transition-all ${data.lining === l.value ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e]"}`}
//               >
//                 {/* Fallback to your beautiful SVGs based on value name */}
//                 <div className="font-serif text-[#f5f0eb] text-sm font-medium">
//                   {l.value}
//                 </div>
//                 <div className="text-[#c9a96e] text-[10px] mt-1">
//                   + £{l.price_delta}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//       {/* button */}
//       {buttonGroup && (
//         <div>
//           <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
//             {buttonGroup.name}
//           </h3>
//           <div className="grid grid-cols-3 gap-4">
//             {buttonGroup.options.map((l: any) => (
//               <button
//                 key={l.id}
//                 onClick={() => onChange({ buttons: l.value })}
//                 className={`p-5 text-center border transition-all ${data.buttons === l.value ? "border-[#c9a96e] bg-[#c9a96e]/8" : "border-[#2e2e2e]"}`}
//               >
//                 {/* Fallback to your beautiful SVGs based on value name */}
//                 <div className="font-serif text-[#f5f0eb] text-sm font-medium">
//                   {l.value}
//                 </div>
//                 <div className="text-[#c9a96e] text-[10px] mt-1">
//                   + £{l.price_delta}
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { StepProps } from "@/lib/types";

/* ==================== 3. CUSTOM DETAILS STEP ==================== */
export function StepDetails({ data, onChange, product }: StepProps) {
  const lapelGroup = product.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("lapel")
  );
  const buttonGroup = product.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("button")
  );
  const liningGroup = product.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("lining")
  );

  return (
    <div className="space-y-10">
      {/* Lapel */}
      {lapelGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {lapelGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {lapelGroup.options?.map((l: any) => (
              <button
                key={l.id}
                onClick={() => onChange({ lapel: l.value })}
                className={`p-5 text-center border transition-all ${
                  data.lapel === l.value 
                    ? "border-[#c9a96e] bg-[#c9a96e]/8" 
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/30"
                }`}
              >
                <div className="font-serif text-[#f5f0eb] text-sm font-medium">
                  {l.value}
                </div>
                <div className="text-[#c9a96e] text-[10px] mt-1">
                  + £{Number(l.price_delta || l.priceDelta || 0).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lining */}
      {liningGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {liningGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {liningGroup.options?.map((l: any) => (
              <button
                key={l.id}
                onClick={() => onChange({ lining: l.value })}
                className={`p-5 text-center border transition-all ${
                  data.lining === l.value 
                    ? "border-[#c9a96e] bg-[#c9a96e]/8" 
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/30"
                }`}
              >
                <div className="font-serif text-[#f5f0eb] text-sm font-medium">
                  {l.value}
                </div>
                <div className="text-[#c9a96e] text-[10px] mt-1">
                  + £{Number(l.price_delta || l.priceDelta || 0).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button */}
      {buttonGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {buttonGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {buttonGroup.options?.map((l: any) => (
              <button
                key={l.id}
                onClick={() => onChange({ buttons: l.value })}
                className={`p-5 text-center border transition-all ${
                  data.buttons === l.value 
                    ? "border-[#c9a96e] bg-[#c9a96e]/8" 
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/30"
                }`}
              >
                <div className="font-serif text-[#f5f0eb] text-sm font-medium">
                  {l.value}
                </div>
                <div className="text-[#c9a96e] text-[10px] mt-1">
                  + £{Number(l.price_delta || l.priceDelta || 0).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
