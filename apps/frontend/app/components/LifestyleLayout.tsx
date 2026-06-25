"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface LifestyleLayoutProps {
  children: ReactNode;
  productName: string;
  currentStep: number;
  totalSteps: number;
  selections: Record<number, any>;
  onSelectionChange: (selections: Record<number, any>) => void;
  onClose: () => void;
}

// Preset configurations for curated designs
const CURATED_DESIGNS = [
  {
    id: "modern-executive",
    title: "The Modern Executive",
    description: "Sharp, contemporary styling for boardroom confidence",
    image:
      "https://images.unsplash.com/photo-1594938374182-7978e5c7c7bd?w=800&q=80&auto=format&fit=crop",
    preset: {
      1: { id: 101, value: "Notch Lapel", priceDelta: "0" },
      2: { id: 201, value: "Slim Fit", priceDelta: "25" },
      3: { id: 301, value: "Navy Super 120s", priceDelta: "75" },
      4: { id: 401, value: "Burgundy Silk", priceDelta: "45" },
      5: { id: 501, value: "Horn Buttons", priceDelta: "15" },
    },
  },
  {
    id: "wedding-classic",
    title: "The Wedding Classic",
    description: "Timeless elegance for your special day",
    image:
      "https://images.unsplash.com/photo-1531895861202-7e2d7d8d7b7d?w-800&q=80&auto=format&fit=crop",
    preset: {
      1: { id: 102, value: "Peak Lapel", priceDelta: "35" },
      2: { id: 202, value: "Classic Fit", priceDelta: "0" },
      3: { id: 302, value: "Midnight Black", priceDelta: "95" },
      4: { id: 402, value: "Silver Jacquard", priceDelta: "65" },
      5: { id: 502, value: "Mother of Pearl", priceDelta: "55" },
    },
  },
  {
    id: "weekend-casual",
    title: "The Weekend Casual",
    description: "Relaxed sophistication for leisure moments",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80&auto=format&fit=crop",
    preset: {
      1: { id: 103, value: "Unstructured", priceDelta: "-20" },
      2: { id: 203, value: "Relaxed Fit", priceDelta: "0" },
      3: { id: 303, value: "Charcoal Tweed", priceDelta: "45" },
      4: { id: 403, value: "Navy Cotton", priceDelta: "25" },
      5: { id: 503, value: "Wooden Buttons", priceDelta: "10" },
    },
  },
];

export function LifestyleLayout({
  children,
  productName,
  currentStep,
  totalSteps,
  selections,
  onSelectionChange,
  onClose,
}: LifestyleLayoutProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [activeDesign, setActiveDesign] = useState<string | null>(null);

  const handleDesignSelect = (designId: string) => {
    const design = CURATED_DESIGNS.find((d) => d.id === designId);
    if (design) {
      setActiveDesign(designId);
      onSelectionChange(design.preset);
    }
  };

  return (
    // <div className="min-h-screen w-full bg-[#0f0f0f] text-[#f5f0eb] flex flex-col items-center justify-center p-32">
    //   {/* Header with Lifestyle Branding */}
    //   {/* <header className="p-6 border-b border-white/10 flex justify-between items-center">
    //     <div>
    //       <h1 className="font-['Playfair_Display'] text-3xl font-bold italic tracking-tight">
    //         Suit Masters
    //       </h1>
    //       <p className="text-[10px] uppercase tracking-widest text-[#c9a96e] mt-1">
    //         {productName} • Crafting Your Signature Style
    //       </p>
    //     </div>

    //     <div className="flex items-center gap-6">
    //       <div className="flex gap-2">
    //         {Array.from({ length: totalSteps }).map((_, i) => (
    //           <div
    //             key={i}
    //             className={`h-1 w-6 rounded-full transition-colors ${i <= currentStep ? "bg-[#c9a96e]" : "bg-white/10"}`}
    //           />
    //         ))}
    //       </div>

    //       <button
    //         onClick={onClose}
    //         className="text-[#9a9490] hover:text-[#f5f0eb] transition-colors"
    //       >
    //         <span className="text-xs uppercase tracking-widest">
    //           Close Studio
    //         </span>
    //       </button>
    //     </div>
    //   </header> */}

    //   <div className="">
    //     {/* Lifestyle Hero Area - Left Side */}
    //     <div className="w-2/5 relative overflow-hidden flex">
    //       <div
    //         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    //         style={{
    //           backgroundImage: `url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80&auto=format&fit=crop')`,
    //           filter: "blur(2px) brightness(0.7)",
    //         }}
    //       />
    //       <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

    //       <div className="relative h-full p-12 flex justify-between">
    //         {/* Editorial Content */}
    //         <div className="max-w-md">
    //           <div className="inline-flex items-center gap-2 bg-[#c9a96e]/10 border border-[#c9a96e]/20 px-4 py-2 rounded-full mb-6">
    //             <Sparkles size={14} className="text-[#c9a96e]" />
    //             <span className="text-xs uppercase tracking-widest text-[#c9a96e]">
    //               Curated Experience
    //             </span>
    //           </div>

    //           <h2 className="font-['Playfair_Display'] text-5xl font-bold leading-tight mb-4">
    //             Design Your <span className="text-[#c9a96e]">Signature</span>{" "}
    //             Suit
    //           </h2>

    //           <p className="text-lg text-[#9a9490] leading-relaxed mb-8">
    //             Begin with a complete look, then fine-tune every detail. Our
    //             curated designs combine expert tailoring with lifestyle context
    //             for a suit that truly represents you.
    //           </p>

    //           {/* Curated Designs Sidebar */}
    //           <div className="space-y-4">
    //             <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2">
    //               Start With a Complete Look
    //             </h3>

    //             <div className="space-y-3">
    //               {CURATED_DESIGNS.map((design) => (
    //                 <motion.button
    //                   key={design.id}
    //                   whileHover={{ scale: 1.02 }}
    //                   whileTap={{ scale: 0.98 }}
    //                   onClick={() => handleDesignSelect(design.id)}
    //                   className={`w-full p-4 rounded-lg border text-left transition-all ${activeDesign === design.id ? "border-[#c9a96e] bg-[#c9a96e]/5" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
    //                 >
    //                   <div className="flex items-start gap-4">
    //                     <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
    //                       <img
    //                         src={design.image}
    //                         alt={design.title}
    //                         className="w-full h-full object-cover"
    //                       />
    //                     </div>
    //                     <div className="flex-1">
    //                       <h4 className="font-['Playfair_Display'] font-semibold mb-1">
    //                         {design.title}
    //                       </h4>
    //                       <p className="text-sm text-[#9a9490]">
    //                         {design.description}
    //                       </p>
    //                       {activeDesign === design.id && (
    //                         <div className="mt-2 text-xs text-[#c9a96e] flex items-center gap-1">
    //                           <span className="w-2 h-2 bg-[#c9a96e] rounded-full"></span>
    //                           Applied to your design
    //                         </div>
    //                       )}
    //                     </div>
    //                   </div>
    //                 </motion.button>
    //               ))}
    //             </div>
    //           </div>
    //         </div>

    //         {/* Lifestyle Quote */}
    //         <div className="border-t border-white/10 pt-6 mt-6">
    //           <p className="font-['Playfair_Display'] italic text-lg text-[#c9a96e]/80">
    //             "A well-tailored suit is to women what lingerie is to men."
    //           </p>
    //           <p className="text-sm text-[#9a9490] mt-2">— Anonymous</p>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Configuration Area - Right Side */}
    //     <div className="w-3/5 flex flex-col">
    //       {/* Main Configuration Panel */}
    //       <div className="flex-1 overflow-hidden">{children}</div>

    //       {/* Progressive Disclosure: Technical Details Accordion */}
    //       <div className="border-t border-white/10">
    //         <button
    //           onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
    //           className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
    //         >
    //           <div className="flex items-center gap-3">
    //             <div className="w-8 h-8 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
    //               <span className="text-[#c9a96e] text-sm">⚙️</span>
    //             </div>
    //             <div className="text-left">
    //               <h3 className="font-['Playfair_Display'] font-semibold">
    //                 Fine-Tune Your Details
    //               </h3>
    //               <p className="text-sm text-[#9a9490]">
    //                 {showTechnicalDetails
    //                   ? "Hide technical options"
    //                   : "Show advanced tailoring options"}
    //               </p>
    //             </div>
    //           </div>
    //           {showTechnicalDetails ? (
    //             <ChevronUp className="text-[#c9a96e]" />
    //           ) : (
    //             <ChevronDown className="text-[#9a9490]" />
    //           )}
    //         </button>

    //         <AnimatePresence>
    //           {showTechnicalDetails && (
    //             <motion.div
    //               initial={{ height: 0, opacity: 0 }}
    //               animate={{ height: "auto", opacity: 1 }}
    //               exit={{ height: 0, opacity: 0 }}
    //               className="overflow-hidden"
    //             >
    //               <div className="p-6 border-t border-white/10 bg-[#151515]">
    //                 <div className="grid grid-cols-3 gap-4">
    //                   {/* Technical options would go here */}
    //                   <div className="p-4 border border-white/10 rounded-lg">
    //                     <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
    //                       Lapel Style
    //                     </div>
    //                     <div className="text-sm">Notch, Peak, Shawl</div>
    //                   </div>
    //                   <div className="p-4 border border-white/10 rounded-lg">
    //                     <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
    //                       Fit Profile
    //                     </div>
    //                     <div className="text-sm">Slim, Classic, Relaxed</div>
    //                   </div>
    //                   <div className="p-4 border border-white/10 rounded-lg">
    //                     <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
    //                       Button Details
    //                     </div>
    //                     <div className="text-sm">2 or 3 buttons</div>
    //                   </div>
    //                 </div>
    //                 <p className="text-sm text-[#9a9490] mt-4 text-center">
    //                   These options are automatically configured when you select
    //                   a curated design above.
    //                 </p>
    //               </div>
    //             </motion.div>
    //           )}
    //         </AnimatePresence>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen w-full bg-[#0f0f0f] text-[#f5f0eb] flex flex-col items-center justify-center p-32">
      {/* Header with Lifestyle Branding */}
      {/* <header className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold italic tracking-tight">
            Suit Masters
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a96e] mt-1">
            {productName} • Crafting Your Signature Style
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-6 rounded-full transition-colors ${i <= currentStep ? "bg-[#c9a96e]" : "bg-white/10"}`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-[#9a9490] hover:text-[#f5f0eb] transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">
              Close Studio
            </span>
          </button>
        </div>
      </header> */}

      <div className="">
        {/* Lifestyle Hero Area - Left Side */}
        <div className="">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://plus.unsplash.com/premium_vector-1750786789338-9ca74d66b567?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmxhYWNrJTIwYW5kJTIwZ29sZCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D')`,
              filter: "blur(2px) brightness(0.7)",
            }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

          <div className="relative h-full">
            {/* Editorial Content */}
            <div className="relative z-10 p-8">
              {/* <div className="inline-flex items-center gap-2 bg-[#c9a96e]/10 border border-[#c9a96e]/20 px-4 py-2 rounded-full mb-6"> */}
              <div className="">
                <Sparkles size={14} className="text-[#c9a96e]" />
                <span className="text-xs uppercase tracking-widest text-[#c9a96e]">
                 Curated Experience
                </span>
              </div>

              <h2 className="font-['Playfair_Display'] text-5xl font-bold leading-tight mb-4">
                Design Your <span className="text-[#c9a96e]">Signature</span>{" "}
                Suit
              </h2>

              <p className="text-lg text-[#9a9490] leading-relaxed mb-8">
                Begin with a complete look, then fine-tune every detail. Our
                curated designs combine expert tailoring with lifestyle context
                for a suit that truly represents you.
              </p>

              {/* Curated Designs Sidebar */}
              <div className="space-y-4">
                <h3 className="font-['Playfair_Display'] text-xl font-semibold mb-2">
                  Start With a Complete Look
                </h3>

                <div className="space-y-3">
                  {CURATED_DESIGNS.map((design) => (
                    <motion.button
                      key={design.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDesignSelect(design.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${activeDesign === design.id ? "border-[#c9a96e] bg-[#c9a96e]/5" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                          <img
                            src={design.image}
                            alt={design.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-['Playfair_Display'] font-semibold mb-1">
                            {design.title}
                          </h4>
                          <p className="text-sm text-[#9a9490]">
                            {design.description}
                          </p>
                          {activeDesign === design.id && (
                            <div className="mt-2 text-xs text-[#c9a96e] flex items-center gap-1">
                              <span className="w-2 h-2 bg-[#c9a96e] rounded-full"></span>
                              Applied to your design
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle Quote */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <p className="font-['Playfair_Display'] italic text-lg text-[#c9a96e]/80">
                "A well-tailored suit is to women what lingerie is to men."
              </p>
              <p className="text-sm text-[#9a9490] mt-2">— Anonymous</p>
            </div>
          </div>
        </div>

        {/* Configuration Area - Right Side */}
        <div className="w-3/5 flex flex-col">
          {/* Main Configuration Panel */}
          <div className="flex-1 overflow-hidden">{children}</div>

          {/* Progressive Disclosure: Technical Details Accordion */}
          <div className="border-t border-white/10">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
                  <span className="text-[#c9a96e] text-sm">⚙️</span>
                </div>
                <div className="text-left">
                  <h3 className="font-['Playfair_Display'] font-semibold">
                    Fine-Tune Your Details
                  </h3>
                  <p className="text-sm text-[#9a9490]">
                    {showTechnicalDetails
                      ? "Hide technical options"
                      : "Show advanced tailoring options"}
                  </p>
                </div>
              </div>
              {showTechnicalDetails ? (
                <ChevronUp className="text-[#c9a96e]" />
              ) : (
                <ChevronDown className="text-[#9a9490]" />
              )}
            </button>

            <AnimatePresence>
              {showTechnicalDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 border-t border-white/10 bg-[#151515]">
                    <div className="grid grid-cols-3 gap-4">
                      {/* Technical options would go here */}
                      <div className="p-4 border border-white/10 rounded-lg">
                        <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
                          Lapel Style
                        </div>
                        <div className="text-sm">Notch, Peak, Shawl</div>
                      </div>
                      <div className="p-4 border border-white/10 rounded-lg">
                        <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
                          Fit Profile
                        </div>
                        <div className="text-sm">Slim, Classic, Relaxed</div>
                      </div>
                      <div className="p-4 border border-white/10 rounded-lg">
                        <div className="text-xs uppercase tracking-widest text-[#c9a96e] mb-2">
                          Button Details
                        </div>
                        <div className="text-sm">2 or 3 buttons</div>
                      </div>
                    </div>
                    <p className="text-sm text-[#9a9490] mt-4 text-center">
                      These options are automatically configured when you select
                      a curated design above.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
