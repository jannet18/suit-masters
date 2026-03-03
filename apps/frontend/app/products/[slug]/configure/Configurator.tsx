// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { XIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
// import { StepSuitStyle } from "@/app/components/fitting/StepSuitStyle";
// import { StepFabric } from "@/app/components/fitting/StepFabric";
// import { StepDetails } from "@/app/components/fitting/StepDetails";
// import { StepMeasurements } from "@/app/components/fitting/StepMeasurement";
// import { StepSummary } from "@/app/components/fitting/StepSummary";
// import { useCartStore } from "@/app/stores/useCartStore";
// import { useRouter } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import { CartItem, FittingData } from "@/lib/types";
// import { measurementSchema } from "@/lib/measurement";

// interface ConfiguratorProps {
//   productId: string;
//   slug: string;
//   isOpen: boolean;
//   onClose: () => void;
// }
// const STEPS = [
//   {
//     id: 0,
//     label: "Style",
//     shortLabel: "01",
//   },
//   {
//     id: 1,
//     label: "Fabric",
//     shortLabel: "02",
//   },
//   {
//     id: 2,
//     label: "Details",
//     shortLabel: "03",
//   },
//   {
//     id: 3,
//     label: "Measurements",
//     shortLabel: "04",
//   },
//   {
//     id: 4,
//     label: "Summary",
//     shortLabel: "05",
//   },
// ];
// const STEP_TITLES = [
//   {
//     title: "Choose Your Style",
//     subtitle: "Select the silhouette that defines you",
//   },
//   {
//     title: "Select Your Fabric",
//     subtitle: "The finest materials from around the world",
//   },
//   {
//     title: "Personalise the Details",
//     subtitle: "Every detail tells your story",
//   },
//   {
//     title: "Your Measurements",
//     subtitle: "Precision tailored to your exact proportions",
//   },
//   {
//     title: "Review Your Order",
//     subtitle: "Your bespoke suit, ready to be crafted",
//   },
// ];
// const PREVIEW_IMAGES = [
//   "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop",
//   "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=800&q=80&fit=crop",
//   "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop",
//   "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fit=crop",
//   "https://images.unsplash.com/photo-1598808503746-f34cfb0e0e2e?w=800&q=80&fit=crop",
// ];

// export function Configurator({
//   productId,
//   isOpen,
//   onClose,
// }: ConfiguratorProps) {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [fittingData, setFittingData] = useState<Partial<FittingData>>({});
//   const [completed, setCompleted] = useState(false);
//   const [unit, setUnit] = useState<"cm" | "in">("cm");
//   const router = useRouter();
//   const { addToCart } = useCartStore();

//   const handleChange = (updates: Partial<FittingData>) => {
//     setFittingData((prev) => ({
//       ...prev,
//       ...updates,
//     }));
//   };

//   const basePrice = 695;
//   const fabricPrices: Record<string, number> = {
//     wool: 0,
//     cashmere: 180,
//     linen: 60,
//     tweed: 90,
//   };

//   useEffect(() => {
//     if (fittingData.style === "tuxedo" && fittingData.lapel === "notch") {
//       handleChange({ lapel: "shawl" });
//     }
//   }, [fittingData.style]);
//   const totalPrice = useMemo(() => {
//     const fabricExtra = fabricPrices[fittingData.fabric] || 0;
//     return basePrice + fabricExtra;
//   }, [fittingData.fabric, basePrice]);

//   // const isStepValid = () => {
//   //   if (currentStep === 0)
//   //     return measurementSchema.safeParse(fittingData.measurements);
//   //   if (currentStep === 1) return fittingData.fabric && fittingData.fabricColor;
//   //   if (currentStep === 2) return fittingData.lapel;
//   //   if (currentStep === 3)
//   //     return Object.values(fittingData.measurements).every(Boolean);
//   //   return true;
//   // };

//   const isStepValid = () => {
//     switch (currentStep) {
//       case 0:
//         return !!fittingData.style && !!fittingData.fit;
//       case 1:
//         return !!fittingData.fabric && !!fittingData.fabricColor;
//       case 2:
//         return !!fittingData.lapel && !!fittingData.lining;
//       case 3:
//         // Ensure measurements object exists and all required fields have values > 0
//         return (
//           fittingData.measurements &&
//           Object.values(fittingData.measurements).every(
//             (val) => Boolean(val) && val !== 0,
//           )
//         );
//       default:
//         return true;
//     }
//   };

//   const goNext = () => {
//     if (!isStepValid()) return;
//   };
//   if (currentStep < STEPS.length - 1) {
//     setDirection(1);
//     setCurrentStep((s) => s + 1);
//   }

//   const goBack = () => {
//     if (currentStep > 0) {
//       setDirection(-1);
//       setCurrentStep((s) => s - 1);
//     }
//   };

//   const handleComplete = () => {
//     const newItem: CartItem = {
//       id: Date.now(),
//       productId,
//       name: "Custom Suit",
//       base_price: basePrice,
//       totalPrice: totalPrice,
//       quantity: 1,
//       product_type: "CUSTOM",
//       image_url: PREVIEW_IMAGES[0],
//       configuration: {
//         ...fittingData,
//         measurements: {
//           ...fittingData.measurements,
//         },
//       },
//     };
//     // const newItem: CartItem = {
//     //   id: Date.now(),
//     //   productId: productId,
//     //   name: "Custom Suit",
//     //   base_price: Number(totalPrice),
//     //   quantity: 1,
//     //   product_type: "CUSTOM",
//     //   image_url: PREVIEW_IMAGES[0],
//     //   configuration: fittingData,
//     // };
//     addToCart(newItem);
//     router.push("/cart");
//   };

//   const handleClose = () => {
//     setTimeout(() => {
//       setCurrentStep(0);
//       setCompleted(false);
//       setFittingData(defaultFittingData);
//     }, 400);
//   };
//   const slideVariants = {
//     enter: (dir: number) => ({
//       x: dir > 0 ? 60 : -60,
//       opacity: 0,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//     },
//     exit: (dir: number) => ({
//       x: dir > 0 ? -60 : 60,
//       opacity: 0,
//     }),
//   };
//   const stepProps = {
//     data: fittingData,
//     onChange: handleChange,
//     basePrice,
//     totalPrice,
//   };

//   const getDynamicPreview = (data: FittingData) => {
//     if (data.style === "double" && data.fabricColor === "navy") {
//       return "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800";
//     }
//     return PREVIEW_IMAGES[currentStep];
//   };
//   return (
//     <>
//       <div
//         className="min-h-screen bg-[#0f0f0f] flex flex-col"
//         role="dialog"
//         aria-modal="true"
//         aria-label="Custom suit fitting wizard"
//       >
//         {/* Top Bar */}
//         <div className="shrink-0 border-b border-[#2e2e2e]">
//           <div className="flex items-center justify-between px-6 lg:px-10 h-16">
//             {/* Logo */}
//             <div>
//               <div className="font-serif text-lg font-bold tracking-[0.15em] text-[#f5f0eb]">
//                 Suit Masters
//               </div>
//               <div className="text-[#c9a96e] text-[8px] tracking-[0.4em] uppercase">
//                 Bespoke Tailoring
//               </div>
//             </div>

//             {/* Step Progress */}
//             <div className="hidden md:flex items-center gap-0">
//               {STEPS.map((step, i) => (
//                 <div key={step.id} className="flex items-center">
//                   <button
//                     onClick={() => {
//                       if (i < currentStep) {
//                         setDirection(-1);
//                         setCurrentStep(i);
//                       }
//                     }}
//                     disabled={i > currentStep}
//                     className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${i === currentStep ? "text-[#c9a96e]" : i < currentStep ? "text-[#9a9490] hover:text-[#f5f0eb] cursor-pointer" : "text-[#3a3a3a] cursor-default"}`}
//                   >
//                     <div
//                       className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${i < currentStep ? "bg-[#c9a96e] text-[#0f0f0f]" : i === currentStep ? "border-2 border-[#c9a96e] text-[#c9a96e]" : "border border-[#2e2e2e] text-[#3a3a3a]"}`}
//                     >
//                       {i < currentStep ? (
//                         <CheckIcon size={10} />
//                       ) : (
//                         step.shortLabel
//                       )}
//                     </div>
//                     <span className="text-[10px] tracking-[0.15em] uppercase font-medium">
//                       {step.label}
//                     </span>
//                   </button>
//                   {i < STEPS.length - 1 && (
//                     <div
//                       className={`w-8 h-px transition-colors duration-500 ${i < currentStep ? "bg-[#c9a96e]" : "bg-[#2e2e2e]"}`}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Mobile Step Indicator */}
//             <div className="md:hidden text-[#9a9490] text-xs tracking-[0.2em]">
//               {currentStep + 1} / {STEPS.length}
//             </div>

//             {/* Close */}
//             <button
//               onClick={handleClose}
//               aria-label="Close fitting wizard"
//               className="w-10 h-10 flex items-center justify-center border border-[#2e2e2e] text-[#9a9490] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200"
//             >
//               <XIcon size={16} />
//             </button>
//           </div>

//           {/* Progress Bar */}
//           <div className="h-0.5 bg-[#1a1a1a]">
//             <motion.div
//               className="h-full bg-[#c9a96e]"
//               animate={{
//                 width: `${((currentStep + 1) / STEPS.length) * 100}%`,
//               }}
//               transition={{
//                 duration: 0.5,
//                 ease: "easeInOut",
//               }}
//             />
//           </div>
//         </div>

//         {/* Main Content */}
//         {completed ? (
//           <motion.div
//             initial={{
//               opacity: 0,
//               scale: 0.95,
//             }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.5,
//             }}
//             className="flex-1 flex items-center justify-center px-6"
//           >
//             <div className="text-center max-w-md">
//               <motion.div
//                 initial={{
//                   scale: 0,
//                 }}
//                 animate={{
//                   scale: 1,
//                 }}
//                 transition={{
//                   type: "spring",
//                   stiffness: 200,
//                   delay: 0.2,
//                 }}
//                 className="w-16 h-16 border border-[#c9a96e] flex items-center justify-center mx-auto mb-8"
//               >
//                 <CheckIcon size={28} className="text-[#c9a96e]" />
//               </motion.div>
//               <h2 className="font-serif text-3xl text-[#f5f0eb] font-bold mb-4">
//                 Order Confirmed
//               </h2>
//               <p className="text-[#9a9490] text-base leading-relaxed mb-8 font-light">
//                 Your bespoke suit is now in the hands of our master tailors.
//                 You'll receive a confirmation email within the hour.
//               </p>
//               <div className="flex items-center justify-center gap-2 text-[#c9a96e] text-sm mb-10">
//                 <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
//                 Estimated delivery: 14–18 working days
//               </div>
//               <button
//                 onClick={handleClose}
//                 className="bg-[#c9a96e] text-[#0f0f0f] px-10 py-4 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//               >
//                 Back to Shop
//               </button>
//             </div>
//           </motion.div>
//         ) : (
//           <div className="flex-1 flex overflow-hidden">
//             {/* Left Preview Panel */}
//             <div className="hidden lg:block w-[38%] xl:w-[42%] shrink-0 relative overflow-hidden">
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={currentStep}
//                   initial={{
//                     opacity: 0,
//                     scale: 1.05,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     scale: 1,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     scale: 0.98,
//                   }}
//                   transition={{
//                     duration: 0.6,
//                   }}
//                   className="absolute inset-0"
//                 >
//                   <img
//                     src={getDynamicPreview(fittingData)}
//                     alt="Suit preview"
//                     className="w-full h-full object-cover object-top"
//                   />
//                   <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]/40" />
//                   <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/60 via-transparent to-transparent" />
//                 </motion.div>
//               </AnimatePresence>

//               {/* Step label overlay */}
//               <div className="absolute bottom-10 left-10">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={currentStep}
//                     initial={{
//                       opacity: 0,
//                       y: 10,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       y: 0,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       y: -10,
//                     }}
//                     transition={{
//                       duration: 0.4,
//                     }}
//                   >
//                     <div className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mb-2">
//                       Step {currentStep + 1} of {STEPS.length}
//                     </div>
//                     <h2 className="font-serif text-3xl text-[#f5f0eb] font-bold leading-tight">
//                       {STEP_TITLES[currentStep].title}
//                     </h2>
//                     <p className="text-[#9a9490] text-sm mt-2 font-light">
//                       {STEP_TITLES[currentStep].subtitle}
//                     </p>
//                   </motion.div>
//                 </AnimatePresence>
//               </div>
//             </div>

//             {/* Right Content Panel */}
//             <div className="flex-1 flex flex-col overflow-hidden">
//               {/* Mobile Step Title */}
//               <div className="lg:hidden px-6 pt-8 pb-4 shrink-0">
//                 <div className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mb-1">
//                   Step {currentStep + 1} of {STEPS.length}
//                 </div>
//                 <h2 className="font-serif text-2xl text-[#f5f0eb] font-bold">
//                   {STEP_TITLES[currentStep].title}
//                 </h2>
//               </div>

//               {/* Scrollable Step Content */}
//               <div className="flex-1 overflow-y-auto px-6 lg:px-10 xl:px-14 py-8 lg:py-10">
//                 <AnimatePresence mode="wait" custom={direction}>
//                   <motion.div
//                     key={currentStep}
//                     custom={direction}
//                     variants={slideVariants}
//                     initial="enter"
//                     animate="center"
//                     exit="exit"
//                     transition={{
//                       duration: 0.35,
//                       ease: "easeInOut",
//                     }}
//                   >
//                     {currentStep === 0 && <StepSuitStyle {...stepProps} />}
//                     {currentStep === 1 && <StepFabric {...stepProps} />}
//                     {currentStep === 2 && <StepDetails {...stepProps} />}
//                     {currentStep === 3 && <StepMeasurements {...stepProps} />}
//                     {currentStep === 4 && <StepSummary {...stepProps} />}
//                   </motion.div>
//                 </AnimatePresence>
//               </div>

//               {/* Bottom Navigation */}
//               <div className="shrink-0 border-t border-[#2e2e2e] px-6 lg:px-10 xl:px-14 py-5">
//                 <div className="flex items-center justify-between">
//                   {/* Back */}
//                   <button
//                     onClick={goBack}
//                     disabled={currentStep === 0}
//                     className={`flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-200 ${currentStep === 0 ? "text-[#3a3a3a] cursor-default" : "text-[#9a9490] hover:text-[#f5f0eb]"}`}
//                   >
//                     <ArrowLeftIcon size={14} />
//                     Back
//                   </button>

//                   {/* Step Dots (mobile) */}
//                   <div className="flex gap-1.5 md:hidden">
//                     {STEPS.map((_, i) => (
//                       <div
//                         key={i}
//                         className={`h-1 transition-all duration-300 ${i === currentStep ? "w-6 bg-[#c9a96e]" : i < currentStep ? "w-3 bg-[#c9a96e]/50" : "w-3 bg-[#2e2e2e]"}`}
//                       />
//                     ))}
//                   </div>

//                   {/* Next / Complete */}
//                   {currentStep < STEPS.length - 1 ? (
//                     <button
//                       onClick={
//                         currentStep === STEPS.length - 1
//                           ? handleComplete
//                           : goNext
//                       }
//                       className="group flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//                     >
//                       {currentStep === STEPS.length - 1
//                         ? "Complete Order"
//                         : "Continue"}
//                       <ArrowRightIcon
//                         size={13}
//                         className="group-hover:translate-x-0.5 transition-transform duration-200"
//                       />
//                     </button>
//                   ) : (
//                     <button
//                       onClick={handleComplete}
//                       className="group flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//                     >
//                       <CheckIcon size={13} />
//                       Place Order
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   XIcon,
//   ArrowLeftIcon,
//   ArrowRightIcon,
//   CheckIcon,
//   Loader2,
// } from "lucide-react";
// import { api } from "@/lib/api/api-client";
// import { useRouter } from "next/navigation";

// // --- Types for Data Integrity ---
// interface CustomOption {
//   id: number;
//   value: string;
//   price_delta: string;
//   metadata?: { imageUrl?: string; colorCode?: string };
// }

// interface CustomGroup {
//   id: number;
//   name: string; // e.g., "Lapel Style", "Fabric"
//   options: CustomOption[];
// }

// export function BespokeConfigurator({
//   productId,
//   slug,
// }: {
//   productId: number;
//   slug: string;
// }) {
//   const [product, setProduct] = useState<any>(null);
//   const [groups, setGroups] = useState<CustomGroup[]>([]);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [selections, setSelections] = useState<Record<number, CustomOption>>(
//     {},
//   );
//   const [measurements, setMeasurements] = useState<Record<string, number>>({});
//   const [loading, setLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();

//   // 1. Load Customization Data from DB
//   useEffect(() => {
//     async function loadConfig() {
//       const res = await api.getProductBySlug(slug);
//       if (res.success) {
//         setProduct(res.product);
//         setGroups(res.product.customizationGroups || []);

//         // Auto-select defaults
//         const defaults: Record<number, CustomOption> = {};
//         res.product.customizationGroups.forEach((g: any) => {
//           if (g.options?.[0]) defaults[g.id] = g.options[0];
//         });
//         setSelections(defaults);
//       }
//       setLoading(false);
//     }
//     loadConfig();
//   }, [slug]);

//   // 2. Dynamic Price Calculation
//   const totalPrice = useMemo(() => {
//     if (!product) return 0;
//     const extra = Object.values(selections).reduce(
//       (sum, opt) => sum + parseFloat(opt.price_delta),
//       0,
//     );
//     return parseFloat(product.base_price) + extra;
//   }, [product, selections]);

//   // 3. Navigation Logic
//   const isLastStep = currentStep === groups.length; // The extra step is for Measurements

//   const handleNext = () => {
//     if (currentStep < groups.length) setCurrentStep((s) => s + 1);
//   };

//   const handleFinish = async () => {
//     setIsSubmitting(true);
//     const payload = {
//       productId,
//       totalPrice,
//       selections: Object.values(selections),
//       measurements,
//     };

//     const res = await api.createBespokeOrder(payload);
//     if (res.success) router.push(`/order-confirmation/${res.orderId}`);
//     setIsSubmitting(false);
//   };

//   if (loading)
//     return (
//       <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e] uppercase tracking-widest text-xs">
//         Preparing your studio...
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#0f0f0f] flex flex-col text-[#f5f0eb]">
//       {/* HEADER */}
//       <header className="h-20 border-b border-white/10 flex items-center justify-between px-10">
//         <div>
//           <h2 className="font-serif text-xl font-bold">Bespoke Studio</h2>
//           <p className="text-[#c9a96e] text-[9px] uppercase tracking-widest">
//             {product.name}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {groups.map((_, i) => (
//             <div
//               key={i}
//               className={`h-1 w-8 rounded-full ${i <= currentStep ? "bg-[#c9a96e]" : "bg-white/10"}`}
//             />
//           ))}
//           <div
//             className={`h-1 w-8 rounded-full ${isLastStep ? "bg-[#c9a96e]" : "bg-white/10"}`}
//           />
//         </div>
//         <button onClick={() => router.back()}>
//           <XIcon size={20} className="text-white/40 hover:text-white" />
//         </button>
//       </header>

//       <div className="flex-1 flex overflow-hidden">
//         {/* LEFT: VISUALIZER */}
//         <div className="w-3/5 bg-[#151515] relative p-20 flex items-center justify-center">
//           <AnimatePresence mode="wait">
//             <motion.img
//               key={currentStep}
//               src={
//                 selections[groups[currentStep]?.id]?.metadata?.imageUrl ||
//                 product.product_image
//               }
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 1.05 }}
//               className="max-h-full object-contain"
//             />
//           </AnimatePresence>
//           <div className="absolute bottom-10 left-10">
//             <span className="text-[#c9a96e] text-xs uppercase tracking-widest">
//               Selected Detail
//             </span>
//             <p className="text-2xl font-serif">
//               {isLastStep
//                 ? "Final Proportions"
//                 : selections[groups[currentStep]?.id]?.value}
//             </p>
//           </div>
//         </div>

//         {/* RIGHT: CONFIG PANEL */}
//         <div className="w-2/5 p-16 flex flex-col border-l border-white/5">
//           <div className="flex-1 overflow-y-auto">
//             {!isLastStep ? (
//               <>
//                 <h3 className="text-[#c9a96e] text-xs uppercase tracking-[0.3em] mb-4">
//                   Choose {groups[currentStep].name}
//                 </h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   {groups[currentStep].options.map((option) => (
//                     <button
//                       key={option.id}
//                       onClick={() =>
//                         setSelections({
//                           ...selections,
//                           [groups[currentStep].id]: option,
//                         })
//                       }
//                       className={`p-6 text-left border transition-all flex justify-between items-center ${
//                         selections[groups[currentStep].id]?.id === option.id
//                           ? "border-[#c9a96e] bg-[#c9a96e]/5"
//                           : "border-white/10 hover:border-white/20"
//                       }`}
//                     >
//                       <div>
//                         <p className="font-medium text-lg">{option.value}</p>
//                         <p className="text-[10px] text-[#9a9490] tracking-widest">
//                           + £{option.price_delta}
//                         </p>
//                       </div>
//                       {selections[groups[currentStep].id]?.id === option.id && (
//                         <CheckIcon size={16} className="text-[#c9a96e]" />
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <div className="space-y-6">
//                 <h3 className="text-[#c9a96e] text-xs uppercase tracking-[0.3em] mb-4">
//                   Measurement Profile
//                 </h3>
//                 {["Chest", "Waist", "Hips", "Shoulder"].map((m) => (
//                   <div key={m}>
//                     <label className="text-[10px] text-[#555] uppercase block mb-2">
//                       {m} (cm)
//                     </label>
//                     <input
//                       type="number"
//                       onChange={(e) =>
//                         setMeasurements({
//                           ...measurements,
//                           [m.toLowerCase()]: Number(e.target.value),
//                         })
//                       }
//                       className="w-full bg-transparent border-b border-white/10 py-2 focus:border-[#c9a96e] outline-none transition-colors"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* FOOTER NAV */}
//           <footer className="pt-10 border-t border-white/10 flex justify-between items-center">
//             <div>
//               <p className="text-[10px] text-[#555] uppercase">
//                 Total Estimate
//               </p>
//               <p className="text-2xl font-serif">£{totalPrice.toFixed(2)}</p>
//             </div>
//             <div className="flex gap-4">
//               <button
//                 onClick={() => setCurrentStep((s) => s - 1)}
//                 disabled={currentStep === 0}
//                 className="p-4 border border-white/10 disabled:opacity-20"
//               >
//                 <ArrowLeftIcon size={18} />
//               </button>
//               <button
//                 onClick={isLastStep ? handleFinish : handleNext}
//                 className="bg-[#c9a96e] text-black px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#b8985d]"
//               >
//                 {isSubmitting ? (
//                   <Loader2 className="animate-spin" />
//                 ) : isLastStep ? (
//                   "Place Order"
//                 ) : (
//                   "Next Step"
//                 )}
//                 <ArrowRightIcon size={16} />
//               </button>
//             </div>
//           </footer>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/api-client";
import { useCartStore } from "@/app/stores/useCartStore";
import { StepSuitStyle } from "@/app/components/fitting/StepSuitStyle";
import { StepFabric } from "@/app/components/fitting/StepFabric";
import { StepDetails } from "@/app/components/fitting/StepDetails";
import { StepMeasurements } from "@/app/components/fitting/StepMeasurement";
import { StepSummary } from "@/app/components/fitting/StepSummary";
import { FittingData } from "@/lib/types";

const initialFittingData: FittingData = {
  style: "",
  fit: "",
  buttons: "2",
  fabric: "",
  fabricColor: "",
  lapel: "",
  lining: "",
  buttonColor: "",
  measurements: {
    unit: "cm", // Ensure this matches your 'Unit' type
    height: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    inseam: 0,
    shoulder: 0,
  },
};

interface ConfiguratorProps {
  productId?: string;
  slug?: string;
  data?: Record<string, any>;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BespokeConfigurator({
  productId = "default",
  slug = "custom",
}: ConfiguratorProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  // --- State ---
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Customization State
  const [selections, setSelections] = useState<FittingData>(initialFittingData);
  const [measurements, setMeasurements] = useState<any>({
    unit: "cm",
    chest: 0,
    waist: 0,
    hips: 0,
    shoulder: 0,
    inseam: 0,
    height: 0,
  });

  // --- 1. Load Data ---
  useEffect(() => {
    async function initConfigurator() {
      const res = await api.getProductBySlug(slug);
      if (res.success) {
        setProduct(res.product);

        // Initialize selections with defaults if available
        const initial: Record<string, any> = {};
        res.product.customizationGroups?.forEach((group: any) => {
          if (group.options?.[0])
            initial[group.name.toLowerCase()] = group.options[0].value;
        });
        setSelections(initialFittingData);
      }
      setLoading(false);
    }
    initConfigurator();
  }, [slug]);

  // --- 2. Dynamic Pricing ---
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    // Calculate extras from selections if your DB returns price_delta
    // For now, using your logic or summing deltas
    return parseFloat(product.base_price || "695");
  }, [product, selections]);

  // --- 3. Step Definition ---
  // We combine DB groups with static steps like Measurements and Summary
  const STEPS = [
    { id: "style", label: "Style" },
    { id: "fabric", label: "Fabric" },
    { id: "details", label: "Details" },
    { id: "measurements", label: "Measurements" },
    { id: "summary", label: "Summary" },
  ];

  // --- 4. Navigation ---
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    // const res = await
    const cartItem = {
      id: Date.now(),
      productId,
      name: `Bespoke ${product.name}`,
      totalPrice,
      product_type: "CUSTOM",
      configuration: {
        ...selections,
        measurements,
      },
    };

    // Option A: Save to DB immediately
    const res = await api.createBespokeOrder(cartItem);

    // Option B: Add to Cart store
    // addToCart(cartItem);

    if (res.success) {
      router.push("/cart");
    }
    setIsSubmitting(false);
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#c9a96e]" size={32} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col overflow-hidden">
      {/* --- TOP NAVIGATION --- */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex flex-col">
          <span className="font-serif text-lg text-[#f5f0eb] font-bold tracking-tight">
            Suit Masters
          </span>
          <span className="text-[#c9a96e] text-[8px] uppercase tracking-[0.4em]">
            Bespoke Studio
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3">
              <span
                className={`text-[10px] uppercase tracking-widest ${i <= currentStep ? "text-[#c9a96e]" : "text-white/20"}`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-4 h-1px bg-white/10" />
              )}
            </div>
          ))}
        </nav>

        <button
          onClick={() => router.back()}
          className="hover:rotate-90 transition-transform duration-300"
        >
          <XIcon size={20} className="text-white/40" />
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: PREVIEW */}
        <div className="hidden lg:block w-[40%] bg-[#121212] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={product.product_image}
                alt="Preview"
                className="w-full h-full object-cover grayscale-20%"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-12 left-12">
            <p className="text-[#c9a96e] text-[10px] uppercase tracking-[0.4em] mb-2">
              Step 0{currentStep + 1}
            </p>
            <h2 className="text-3xl font-serif text-white">
              {STEPS[currentStep].label}
            </h2>
          </div>
        </div>

        {/* RIGHT: INTERACTION */}
        <div className="flex-1 flex flex-col bg-[#0f0f0f]">
          <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-12">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
                transition={{ duration: 0.4 }}
              >
                {currentStep === 0 && (
                  <StepSuitStyle
                    data={selections}
                    onChange={(newData) =>
                      setSelections((prev) => ({ ...prev, ...newData }))
                    }
                    basePrice={parseFloat(product.base_price)}
                    totalPrice={totalPrice}
                  />
                )}
                {currentStep === 1 && (
                  <StepFabric
                    data={selections}
                    onChange={(newData) =>
                      setSelections((prev) => ({ ...prev, ...newData }))
                    }
                    basePrice={parseFloat(product.base_price)}
                    totalPrice={totalPrice}
                  />
                )}
                {currentStep === 2 && (
                  <StepDetails
                    data={selections}
                    onChange={(newData) =>
                      setSelections((prev) => ({ ...prev, ...newData }))
                    }
                    basePrice={parseFloat(product.base_price)}
                    totalPrice={totalPrice}
                  />
                )}
                {currentStep === 3 && (
                  <StepMeasurements
                    data={measurements}
                    onChange={setMeasurements}
                    basePrice={parseFloat(product.base_price)}
                    totalPrice={totalPrice}
                  />
                )}
                {currentStep === 4 && (
                  <StepSummary
                    data={selections}
                    onChange={(newData) =>
                      setSelections((prev) => ({ ...prev, ...newData }))
                    }
                    basePrice={parseFloat(product.base_price)}
                    totalPrice={totalPrice}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FOOTER */}
          <footer className="h-24 border-t border-white/5 px-6 lg:px-16 flex items-center justify-between shrink-0 bg-[#0f0f0f]">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">
                Estimated Total
              </span>
              <span className="text-xl font-serif text-[#c9a96e]">
                £{totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="p-4 border border-white/10 text-white/40 hover:text-white disabled:opacity-0 transition-all"
              >
                <ArrowLeftIcon size={20} />
              </button>

              <button
                onClick={
                  currentStep === STEPS.length - 1 ? handleComplete : handleNext
                }
                disabled={isSubmitting}
                className="bg-[#c9a96e] text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#dfc08a] transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : currentStep === STEPS.length - 1 ? (
                  "Confirm Order"
                ) : (
                  "Continue"
                )}
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
