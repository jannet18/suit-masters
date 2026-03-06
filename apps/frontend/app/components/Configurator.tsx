// // "use client";

// // import { useEffect, useState, useMemo } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   XIcon,
// //   ArrowLeftIcon,
// //   ArrowRightIcon,
// //   CheckIcon,
// //   Loader2,
// // } from "lucide-react";
// // import { useRouter } from "next/navigation";
// // import { api } from "@/lib/api/api-client";
// // import { useCartStore } from "@/app/stores/useCartStore";
// // import { ConfigureProps, FittingData, StepProps } from "@/lib/types";
// // import { LifestyleLayout } from "@/app/components/lifestyle/LifestyleLayout";

// // const initialFittingData: FittingData = {
// //   style: "",
// //   fit: "",
// //   fabric: "",
// //   fabricColor: "",
// //   lapel: "",
// //   lining: "",
// //   buttons: "2",
// //   buttonColor: "",
// //   measurements: {
// //     unit: "cm",
// //     height: 0,
// //     chest: 0,
// //     waist: 0,
// //     hips: 0,
// //     inseam: 0,
// //     shoulder: 0,
// //   },
// // };
// // export function BespokeConfigurator({ slug, isOpen, onClose }: ConfigureProps) {
// //   const router = useRouter();
// //   const { addToCart, globalMeasurements, setGlobalMeasurements } =
// //     useCartStore();
// //   const [product, setProduct] = useState<any>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [currentStep, setCurrentStep] = useState(0);
// //   const [fittingData, setFittingData] =
// //     useState<FittingData>(initialFittingData);
// //   const [selections, setSelections] = useState<Record<number, any>>({});
// //   const [measurements, setMeasurements] =
// //     useState<Record<string, number>>(globalMeasurements);

// //   useEffect(() => {
// //     async function init() {
// //       const productSlug = typeof slug === "string" ? slug : (slug as any).slug;
// //       if (!productSlug) return;
// //       setLoading(true);
// //       try {
// //         const res = await api.getProductBySlug(productSlug);
// //         if (res?.success && res.product) {
// //           setProduct(res.product);
// //           // Default: Select the first option for every group automatically
// //           const defaults: Record<number, any> = {};
// //           res.product.customizationGroups.forEach((group: any) => {
// //             if (group.options?.length > 0)
// //               defaults[group.id] = group.options[0];
// //           });
// //           setSelections(defaults);
// //         } else {
// //           console.error("Product fetch failed", res);
// //           router.push("/collections");
// //         }
// //       } catch (error) {
// //         console.error("Configurator Init Error:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     init();
// //   }, [slug, router]);

// //   // Dynamic Price Calculation
// //   const totalPrice = useMemo(() => {
// //     if (!product) return 0;

// //     const base = parseFloat(product.base_price) || 0;
// //     const extra = Object.values(selections).reduce((acc, opt) => {
// //       return acc + (parseFloat(opt.price_delta || opt.priceDelta) || 0);
// //     }, 0);
// //     return base + extra;
// //     // let extra = 0;
// //     // product.customizationGroups?.forEach((group: any) => {
// //     //   const userValue = (fittingData as any)[group.name.toLowerCase()];
// //     //   const match = group.options.find((opt: any) => opt.value === userValue);
// //     //   if (match) extra += parseFloat(match.price_delta);
// //     // });
// //     // return parseFloat(product.base_price) + extra;
// //   }, [product, fittingData]);

// //   const stepProps: StepProps = {
// //     data: fittingData,
// //     onChange: (updates) => setFittingData((prev) => ({ ...prev, ...updates })),
// //     product: product,
// //     basePrice: parseFloat(product?.base_price),
// //     totalPrice: Number(totalPrice),
// //   };

// //   const handleAddToCart = () => {
// //     if (!product) return;
// //     const cartItem = {
// //       id: Date.now(),
// //       productId: product.id,
// //       name: `Bespoke ${product.name}`,
// //       base_price: parseFloat(product.base_price),
// //       totalPrice: totalPrice,
// //       quantity: 1,
// //       product_type: "CUSTOM" as const,
// //       image_url:
// //         typeof product.product_image === "string"
// //           ? product.product_image
// //           : product.product_image?.default || "",
// //       // We send the full snapshot to the cart
// //       configuration: {
// //         selections: Object.values(selections),
// //         measurements: globalMeasurements,
// //       },
// //     };
// //     addToCart(cartItem);
// //     router.push("/cart");
// //   };

// //   if (loading)
// //     return (
// //       <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
// //         LOADING STUDIO...
// //       </div>
// //     );
// //   // Logic: Steps = All DB Groups + 1 Final Measurement Step
// //   const totalSteps = (product?.customizationGroups?.length || 0) + 1;
// //   const isMeasurementStep =
// //     currentStep === product?.customizationGroups?.length;
// //   const handleMeasurementChange = (key: string, value: number) => {
// //     const updated = { ...measurements, [key]: value };
// //     setMeasurements(updated);
// //     setGlobalMeasurements(updated); // Sync to persistence
// //   };
// //   const currentGroup = product?.customizationGroups[currentStep];

// //   return (
// //     <>
// //       <LifestyleLayout
// //         productName={product?.name || "Custom Suit"}
// //         currentStep={currentStep}
// //         totalSteps={totalSteps}
// //         selections={selections}
// //         onSelectionChange={setSelections}
// //         onClose={() => router.back()}
// //       >
// //         {/* Configuration Content - Right Side */}
// //         <div className="h-full flex">
// //           {/* Visualizer Panel */}
// //           <div className="w-1/2 bg-[#151515] flex items-center justify-center p-12 relative">
// //             <AnimatePresence mode="wait">
// //               <motion.img
// //                 key={currentStep}
// //                 src={product?.product_image?.default || product?.product_image}
// //                 initial={{ opacity: 0, scale: 0.95 }}
// //                 animate={{ opacity: 1, scale: 1 }}
// //                 exit={{ opacity: 0, scale: 1.05 }}
// //                 className="max-h-full object-contain z-10"
// //               />
// //             </AnimatePresence>
// //             <div className="absolute bottom-10 left-10">
// //               <p className="text-[#c9a96e] text-xs uppercase tracking-widest mb-1">
// //                 Current Investment
// //               </p>
// //               <p className="text-3xl font-['Playfair_Display'] font-bold">
// //                 £ {totalPrice.toFixed(2)}
// //               </p>
// //             </div>
// //           </div>

// //           {/* Selection Panel */}
// //           <div className="w-1/2 p-12 flex flex-col border-l border-white/5">
// //             <div className="flex-1 overflow-y-auto">
// //               {!isMeasurementStep ? (
// //                 <div className="space-y-8">
// //                   <h2 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e] mb-6">
// //                     Refine Your {currentGroup?.name}
// //                   </h2>
// //                   <header>
// //                     <span className="text-[#c9a96e] text-[10px] uppercase tracking-[0.4em]">
// //                       Step {currentStep + 1}
// //                     </span>
// //                     <h2 className="text-3xl font-serif text-white mt-2">
// //                       {currentGroup?.name}
// //                     </h2>
// //                   </header>
// //                   <div className="grid gap-4">
// //                     {currentGroup &&
// //                       currentGroup.options.map((option: any) => (
// //                         <button
// //                           key={option.id}
// //                           onClick={() =>
// //                             setSelections({
// //                               ...selections,
// //                               [currentGroup.id]: option,
// //                             })
// //                           }
// //                           className={`p-6 border text-left flex justify-between items-center transition-all ${selections[currentGroup.id]?.id === option.id ? "border-[#c9a96e] bg-[#c9a96e]/5" : "border-white/10 hover:border-white/30"}`}
// //                         >
// //                           <div>
// //                             <span className="font-medium">{option.value}</span>
// //                             <span className="text-xs text-[#9a9490]">
// //                               {parseFloat(
// //                                 option.priceDelta || option.price_delta || 0,
// //                               ) > 0
// //                                 ? `+ £${option.priceDelta || option.price_delta}`
// //                                 : "Included"}
// //                             </span>
// //                           </div>
// //                           {selections[currentGroup.id]?.id === option.id && (
// //                             <CheckIcon size={16} className="text-[#c9a96e]" />
// //                           )}
// //                         </button>
// //                       ))}
// //                   </div>
// //                 </div>
// //               ) : (
// //                 <div className="space-y-8">
// //                   <h2 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e]">
// //                     Your Perfect Fit
// //                   </h2>
// //                   {Object.keys(measurements).map((key) => (
// //                     <div key={key} className="border-b border-white/10 pb-2">
// //                       <label className="text-[10px] uppercase text-[#555] block">
// //                         {key} (cm)
// //                       </label>
// //                       <input
// //                         type="number"
// //                         className="bg-transparent w-full outline-none py-2 text-xl"
// //                         value={measurements[key]}
// //                         onChange={(e) =>
// //                           handleMeasurementChange(key, Number(e.target.value))
// //                         }
// //                       />
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </div>

// //             <footer className="pt-8 border-t border-white/10 flex justify-between">
// //               <button
// //                 disabled={currentStep === 0}
// //                 onClick={() => setCurrentStep((s) => s - 1)}
// //                 className="flex items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-30 hover:text-[#c9a96e] transition-colors"
// //               >
// //                 <ArrowLeftIcon size={14} /> Previous
// //               </button>
// //               <button
// //                 onClick={
// //                   isMeasurementStep
// //                     ? handleAddToCart
// //                     : () => setCurrentStep((s) => s + 1)
// //                 }
// //                 className="bg-[#c9a96e] text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#b8985d] transition-colors"
// //               >
// //                 {isMeasurementStep ? "Add to Suit Bag" : "Continue"}{" "}
// //                 <ArrowRightIcon size={14} />
// //               </button>
// //             </footer>
// //           </div>
// //         </div>
// //       </LifestyleLayout>
// //     </>
// //   );
// // }

// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { XIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { api } from "@/lib/api/api-client";
// import { useCartStore } from "@/app/stores/useCartStore";
// import { ConfigureProps, FittingData } from "@/lib/types";
// import { LifestyleLayout } from "./lifestyle/LifestyleLayout";

// const STEPS = [
//   { id: 0, label: "Style", short: "01" },
//   { id: 1, label: "Fabric", short: "02" },
//   { id: 2, label: "Details", short: "03" },
//   { id: 3, label: "Measurements", short: "04" },
//   { id: 4, label: "Summary", short: "05" },
// ];

// export function BespokeConfigurator({ slug }: ConfigureProps) {
//   const router = useRouter();
//   const { addToCart, globalMeasurements, setGlobalMeasurements } =
//     useCartStore();

//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [selections, setSelections] = useState<Record<number, any>>({});
//   const [measurements, setMeasurements] =
//     useState<Record<string, number>>(globalMeasurements);

//   useEffect(() => {
//     async function init() {
//       const productSlug = typeof slug === "string" ? slug : (slug as any).slug;
//       if (!productSlug) return;
//       setLoading(true);
//       try {
//         const res = await api.getProductBySlug(productSlug);
//         if (res?.success && res.product) {
//           setProduct(res.product);
//           const defaults: Record<number, any> = {};
//           res.product.customizationGroups.forEach((group: any) => {
//             if (group.options?.length > 0)
//               defaults[group.id] = group.options[0];
//           });
//           setSelections(defaults);
//         }
//       } catch (error) {
//         console.error("Configurator Init Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     init();
//   }, [slug]);

//   const totalPrice = useMemo(() => {
//     if (!product) return 0;
//     const base = parseFloat(product.base_price) || 0;
//     const extra = Object.values(selections).reduce((acc, opt) => {
//       return acc + (parseFloat(opt.price_delta || opt.priceDelta) || 0);
//     }, 0);
//     return base + extra;
//   }, [product, selections]);

//   const handleAddToCart = () => {
//     if (!product) return;
//     addToCart({
//       id: Date.now(),
//       productId: product.id,
//       name: `Bespoke ${product.name}`,
//       base_price: parseFloat(product.base_price),
//       totalPrice: totalPrice,
//       quantity: 1,
//       product_type: "CUSTOM",
//       image_url: product.product_image?.default || product.product_image || "",
//       configuration: {
//         selections: Object.values(selections),
//         measurements: globalMeasurements,
//       },
//     });
//     router.push("/cart");
//   };

//   if (loading)
//     return (
//       <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e] tracking-[0.4em] uppercase text-xs">
//         Initialising Studio...
//       </div>
//     );

//   const totalSteps = (product?.customizationGroups?.length || 0) + 1;
//   const isMeasurementStep =
//     currentStep === product?.customizationGroups?.length;
//   const currentGroup = product?.customizationGroups[currentStep];

//   return (
//     <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col font-sans text-[#f5f0eb]">
//       {/* --- TOP BAR --- */}
//       <div className="shrink-0 border-b border-[#2e2e2e]">
//         <div className="flex items-center justify-between px-6 lg:px-10 h-20">
//           <div>
//             <div className="font-serif text-xl font-bold tracking-widest">
//               SUIT MASTERS
//             </div>
//             <div className="text-[#c9a96e] text-[8px] tracking-[0.4em] uppercase">
//               Bespoke Tailoring
//             </div>
//           </div>

//           <div className="hidden md:flex items-center">
//             {STEPS.map((step, i) => (
//               <div key={step.id} className="flex items-center">
//                 <button
//                   onClick={() => i < currentStep && setCurrentStep(i)}
//                   className={`flex items-center gap-2 px-4 py-2 transition-all ${
//                     i === currentStep
//                       ? "text-[#c9a96e]"
//                       : i < currentStep
//                         ? "text-[#9a9490]"
//                         : "text-[#3a3a3a]"
//                   }`}
//                 >
//                   <div
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
//                       i <= currentStep ? "border-[#c9a96e]" : "border-[#2e2e2e]"
//                     } ${i < currentStep ? "bg-[#c9a96e] text-black" : ""}`}
//                   >
//                     {i < currentStep ? <CheckIcon size={12} /> : step.short}
//                   </div>
//                   <span className="text-[10px] tracking-widest uppercase">
//                     {step.label}
//                   </span>
//                 </button>
//                 {i < STEPS.length - 1 && (
//                   <div
//                     className={`w-12 h-px ${i < currentStep ? "bg-[#c9a96e]" : "bg-[#2e2e2e]"}`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={() => router.back()}
//             className="w-10 h-10 flex items-center justify-center border border-[#2e2e2e] text-[#9a9490] hover:border-[#c9a96e] transition-all"
//           >
//             <XIcon size={18} />
//           </button>
//         </div>
//       </div>
//       {/* --- MAIN CONTENT --- */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* LEFT: EDITORIAL VIEW */}
//         <div className="hidden lg:block w-[45%] relative overflow-hidden bg-[#151515]">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentStep}
//               initial={{ opacity: 0, scale: 1.05 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.98 }}
//               transition={{ duration: 0.8 }}
//               className="absolute inset-0"
//             >
//               <img
//                 src={product?.product_image?.default || product?.product_image}
//                 alt="Product Preview"
//                 className="w-full h-full object-cover object-top opacity-80"
//               />
//               <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]" />
//             </motion.div>
//           </AnimatePresence>

//           <div className="absolute bottom-16 left-16 max-w-sm">
//             <div className="text-[#c9a96e] text-[10px] uppercase tracking-[0.5em] mb-4">
//               Step {currentStep + 1} of {totalSteps}
//             </div>
//             <h2 className="font-serif text-5xl font-bold leading-tight mb-4">
//               {isMeasurementStep
//                 ? "The Perfect Fit"
//                 : `Choose Your ${currentGroup?.name}`}
//             </h2>
//             <div className="mt-8">
//               <p className="text-[#c9a96e] text-[10px] uppercase tracking-[0.3em] mb-1">
//                 Total Investment
//               </p>
//               <p className="text-4xl font-serif">£ {totalPrice.toFixed(2)}</p>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT: SELECTION PANEL */}
//         <div className="flex-1 flex flex-col bg-[#0f0f0f]">
//           <div className="flex-1 overflow-y-auto px-8 lg:px-20 py-16">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentStep}
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="max-w-xl"
//               >
//                 {!isMeasurementStep ? (
//                   <div className="space-y-10">
//                     <div>
//                       <h3 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e] mb-2">
//                         Style Selection
//                       </h3>
//                       <p className="text-[#9a9490] font-light text-sm italic">
//                         Define the silhouette that best represents your persona.
//                       </p>
//                     </div>
//                     <div className="grid grid-cols-1 gap-4">
//                       {currentGroup?.options.map((option: any) => (
//                         <button
//                           key={option.id}
//                           onClick={() =>
//                             setSelections({
//                               ...selections,
//                               [currentGroup.id]: option,
//                             })
//                           }
//                           className={`group p-8 border text-left flex justify-between items-center transition-all ${
//                             selections[currentGroup.id]?.id === option.id
//                               ? "border-[#c9a96e] bg-[#c9a96e]/5"
//                               : "border-white/5 hover:border-white/20"
//                           }`}
//                         >
//                           <div>
//                             <span
//                               className={`block text-lg transition-colors ${selections[currentGroup.id]?.id === option.id ? "text-[#c9a96e]" : "text-[#f5f0eb]"}`}
//                             >
//                               {option.value}
//                             </span>
//                             <span className="text-[10px] uppercase tracking-widest text-[#9a9490] mt-1">
//                               {parseFloat(option.price_delta) > 0
//                                 ? `+ £${option.price_delta}`
//                                 : "Complimentary"}
//                             </span>
//                           </div>
//                           <div
//                             className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
//                               selections[currentGroup.id]?.id === option.id
//                                 ? "border-[#c9a96e] bg-[#c9a96e]"
//                                 : "border-white/20"
//                             }`}
//                           >
//                             {selections[currentGroup.id]?.id === option.id && (
//                               <CheckIcon size={12} className="text-black" />
//                             )}
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-12">
//                     <h3 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e]">
//                       Personal Proportions
//                     </h3>
//                     <div className="grid grid-cols-2 gap-8">
//                       {Object.keys(measurements).map((key) => (
//                         <div
//                           key={key}
//                           className="border-b border-white/10 pb-4"
//                         >
//                           <label className="text-[10px] uppercase text-[#9a9490] tracking-widest block mb-2">
//                             {key} (cm)
//                           </label>
//                           <input
//                             type="number"
//                             className="bg-transparent w-full outline-none text-2xl font-serif text-[#f5f0eb]"
//                             value={measurements[key]}
//                             onChange={(e) => {
//                               const val = Number(e.target.value);
//                               setMeasurements((p) => ({ ...p, [key]: val }));
//                               setGlobalMeasurements({
//                                 ...measurements,
//                                 [key]: val,
//                               });
//                             }}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {/* BOTTOM NAVIGATION */}
//           <div className="shrink-0 border-t border-white/5 px-8 lg:px-20 py-8 flex justify-between items-center bg-[#0a0a0a]">
//             <button
//               disabled={currentStep === 0}
//               onClick={() => setCurrentStep((s) => s - 1)}
//               className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#9a9490] hover:text-[#f5f0eb] disabled:opacity-20 transition-all"
//             >
//               <ArrowLeftIcon size={14} /> Back
//             </button>

//             <button
//               onClick={
//                 isMeasurementStep
//                   ? handleAddToCart
//                   : () => setCurrentStep((s) => s + 1)
//               }
//               className="bg-[#c9a96e] text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 hover:bg-[#e2c691] transition-all"
//             >
//               {isMeasurementStep
//                 ? "Finalise Bespoke Suit"
//                 : "Continue Selection"}
//               <ArrowRightIcon size={14} />
//             </button>
//           </div>
//         </div>
//       </div>
//       <div>
//         {" "}
//         {/* <LifestyleLayout
//           productName={product?.name || "Custom Suit"}
//           currentStep={currentStep}
//           totalSteps={totalSteps}
//           selections={selections}
//           onSelectionChange={setSelections}
//           onClose={() => router.back()}
//         /> */}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// Import your custom Step Components
import { StepSuitStyle } from "./fitting/StepSuitStyle";
import { StepFabric } from "./fitting/StepFabric";
import { StepDetails } from "./fitting/StepDetails";
import { StepSummary } from "./fitting/StepSummary";
import { api } from "@/lib/api/api-client";
import { useCartStore } from "@/app/stores/useCartStore";
import { ConfigureProps, FittingData, StepProps } from "@/lib/types";
import { StepMeasurements } from "./fitting/StepMeasurement";

const STEPS = [
  {
    id: 0,
    label: "Style",
    short: "01",
    title: "Choose Your Style",
    subtitle: "Select the silhouette that defines you",
  },
  {
    id: 1,
    label: "Fabric",
    short: "02",
    title: "Select Your Fabric",
    subtitle: "The finest materials from around the world",
  },
  {
    id: 2,
    label: "Details",
    short: "03",
    title: "Personalise Details",
    subtitle: "Every detail tells your story",
  },
  {
    id: 3,
    label: "Measurements",
    short: "04",
    title: "Precision Fit",
    subtitle: "Precision tailored to your exact proportions",
  },
  {
    id: 4,
    label: "Summary",
    short: "05",
    title: "Final Review",
    subtitle: "Your bespoke suit, ready to be crafted",
  },
];

export function BespokeConfigurator({ slug }: ConfigureProps) {
  const router = useRouter();
  const { addToCart, globalMeasurements, setGlobalMeasurements } =
    useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [fittingData, setFittingData] = useState<FittingData>({
    style: "",
    fit: "",
    fabric: "",
    fabricColor: "",
    lapel: "",
    lining: "",
    buttons: "2",
    buttonColor: "",
    measurements: {
      unit: "cm" as const,
      height: globalMeasurements.height || 0,
      chest: globalMeasurements.chest || 0,
      waist: globalMeasurements.waist || 0,
      hips: globalMeasurements.hips || 0,
      inseam: globalMeasurements.inseam || 0,
      shoulder: globalMeasurements.shoulder || 0,
    },
  });

  useEffect(() => {
    async function init() {
      const pSlug = typeof slug === "string" ? slug : (slug as any).slug;
      if (!pSlug) return;
      try {
        const res = await api.getProductBySlug(pSlug);
        if (res?.success) setProduct(res.product);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    // Calculation logic matching your StepSummary
    return parseFloat(product.base_price) || 0;
  }, [product, fittingData]);

  const handleAddToCart = () => {
    if (!product) return;

    // Convert fittingData selections to selected_options format
    const selectedOptions: any[] = [];

    // Map style selection
    if (fittingData.style) {
      selectedOptions.push({
        id: Date.now() + 1,
        group_id: 1, // Style group ID
        label: fittingData.style,
        price_impact: "0",
      });
    }

    // Map fabric selection
    if (fittingData.fabric) {
      selectedOptions.push({
        id: Date.now() + 2,
        group_id: 2, // Fabric group ID
        label: fittingData.fabric,
        price_impact: "0",
      });
    }

    // Map fabric color selection
    if (fittingData.fabricColor) {
      selectedOptions.push({
        id: Date.now() + 3,
        group_id: 3, // Color group ID
        label: fittingData.fabricColor,
        price_impact: "0",
      });
    }

    // Map lapel selection
    if (fittingData.lapel) {
      selectedOptions.push({
        id: Date.now() + 4,
        group_id: 4, // Lapel group ID
        label: fittingData.lapel,
        price_impact: "0",
      });
    }

    // Map lining selection
    if (fittingData.lining) {
      selectedOptions.push({
        id: Date.now() + 5,
        group_id: 5, // Lining group ID
        label: fittingData.lining,
        price_impact: "0",
      });
    }

    // Map buttons selection
    if (fittingData.buttons) {
      selectedOptions.push({
        id: Date.now() + 6,
        group_id: 6, // Buttons group ID
        label: `${fittingData.buttons}-button`,
        price_impact: "0",
      });
    }

    // Map button color selection
    if (fittingData.buttonColor) {
      selectedOptions.push({
        id: Date.now() + 7,
        group_id: 7, // Button color group ID
        label: fittingData.buttonColor,
        price_impact: "0",
      });
    }

    // Create cart item
    const cartItem = {
      id: product.id,
      productId: product.id,
      name: `Bespoke ${product.name}`,
      base_price: product.base_price.toString(),
      totalPrice: totalPrice,
      quantity: 1,
      product_type: "CUSTOM" as const,
      image_url:
        typeof product.product_image === "string"
          ? product.product_image
          : product.product_image?.default || "",
      selected_options: selectedOptions,
      configuration: {
        selections: selectedOptions,
        measurements: fittingData.measurements,
      },
    };

    console.log("Adding custom product to cart:", cartItem);
    addToCart(cartItem);
    router.push("/cart");
  };

  const handleChange = (updates: Partial<FittingData>) => {
    setFittingData((prev) => ({ ...prev, ...updates }));
    if (updates.measurements) {
      // Extract numeric measurements only (excluding unit which is a string)
      const { unit, ...numericMeasurements } = updates.measurements;
      setGlobalMeasurements(numericMeasurements);
    }
  };

  // Only create stepProps if product is loaded
  const stepProps: StepProps | null = product
    ? {
        data: fittingData,
        onChange: handleChange,
        product: product,
        basePrice: parseFloat(product?.base_price || 0),
        totalPrice: totalPrice,
      }
    : null;

  const renderStepContent = () => {
    if (!stepProps) return null;

    switch (currentStep) {
      case 0:
        return <StepSuitStyle {...stepProps} />;
      case 1:
        return <StepFabric {...stepProps} />;
      case 2:
        return <StepDetails {...stepProps} />;
      case 3:
        return <StepMeasurements {...stepProps} />;
      case 4:
        return <StepSummary {...stepProps} />;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
        LOADING ATELIER...
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col font-sans text-[#f5f0eb]">
      {/* Top Navigation Bar */}
      <header className="shrink-0 border-b border-white/5 h-20 flex items-center justify-between px-10">
        <div className="font-serif tracking-widest text-xl">SUIT MASTERS</div>

        <nav className="hidden md:flex items-center gap-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase transition-colors ${i === currentStep ? "text-[#c9a96e]" : "text-zinc-600"}`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center ${i <= currentStep ? "border-[#c9a96e]" : "border-zinc-800"}`}
              >
                {i < currentStep ? <CheckIcon size={12} /> : s.short}
              </span>
              {s.label}
            </div>
          ))}
        </nav>

        <button
          onClick={() => router.back()}
          className="p-2 border border-white/10 hover:border-[#c9a96e] transition-colors"
        >
          <XIcon size={20} />
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Visualizer Panel (Left) */}
        <section className="hidden lg:block w-[40%] relative bg-[#0a0a0a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={product?.product_image}
                className="w-full h-full object-cover opacity-60"
                alt="Suit"
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-16 left-16">
            <span className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase">
              Commission Investment
            </span>
            <h2 className="text-4xl font-serif mt-2">
              £{totalPrice.toFixed(2)}
            </h2>
          </div>
        </section>

        {/* Selection Panel (Right) */}
        <section className="flex-1 flex flex-col bg-[#0f0f0f] border-l border-white/5">
          <div className="flex-1 overflow-y-auto px-8 lg:px-20 py-12">
            <div className="max-w-2xl mx-auto">
              <header className="mb-12">
                <span className="text-[#c9a96e] text-[10px] tracking-[0.4em] uppercase">
                  Step {currentStep + 1}
                </span>
                <h2 className="text-3xl font-serif mt-2">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-zinc-500 text-sm mt-2">
                  {STEPS[currentStep].subtitle}
                </p>
              </header>
              {renderStepContent()}
            </div>
          </div>

          <footer className="h-24 border-t border-white/5 flex items-center justify-between px-8 lg:px-20 bg-[#0d0d0d]">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-zinc-500 hover:text-white disabled:opacity-0 transition-all"
            >
              <ArrowLeftIcon size={16} /> Back
            </button>
            <button
              onClick={() =>
                currentStep === STEPS.length - 1
                  ? handleAddToCart()
                  : setCurrentStep((s) => s + 1)
              }
              className="bg-[#c9a96e] text-black px-12 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all"
            >
              {currentStep === STEPS.length - 1
                ? "Add to Wardrobe"
                : "Continue"}{" "}
              <ArrowRightIcon size={16} className="ml-2 inline" />
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
}
