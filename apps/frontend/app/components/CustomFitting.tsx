// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { XIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
// import { StepSuitStyle } from "./fitting/StepSuitStyle";
// import { StepFabric } from "./fitting/StepFabric";
// import { StepDetails } from "./fitting/StepDetails";
// // import { StepMeasurements } from "./fitting/StepMeasurements";
// import { StepSummary } from "./fitting/StepSummary";
// import { StepMeasurements } from "./fitting/StepMeasurement";
// import type { FittingData } from "../../lib/types";
// interface CustomFittingProps {
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
// const defaultFittingData: FittingData = {
//   style: "",
//   fit: "",
//   buttons: "2",
//   fabric: "",
//   fabricColor: "",
//   lapel: "",
//   lining: "",
//   buttonColor: "",
//   measurements: {
//     unit: "cm" as const,
//     height: 0,
//     chest: 0,
//     waist: 0,
//     hips: 0,
//     inseam: 0,
//     shoulder: 0,
//   },
// };
// export function CustomFitting({ isOpen, onClose }: CustomFittingProps) {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [direction, setDirection] = useState(1);
//   const [fittingData, setFittingData] =
//     useState<FittingData>(defaultFittingData);
//   const [completed, setCompleted] = useState(false);
//   const handleChange = (updates: Partial<FittingData>) => {
//     setFittingData((prev) => ({
//       ...prev,
//       ...updates,
//     }));
//   };
//   const goNext = () => {
//     if (currentStep < STEPS.length - 1) {
//       setDirection(1);
//       setCurrentStep((s) => s + 1);
//     }
//   };
//   const goBack = () => {
//     if (currentStep > 0) {
//       setDirection(-1);
//       setCurrentStep((s) => s - 1);
//     }
//   };
//   const handleComplete = () => {
//     setCompleted(true);
//   };
//   const handleClose = () => {
//     onClose();
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
//   };
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{
//             opacity: 0,
//           }}
//           animate={{
//             opacity: 1,
//           }}
//           exit={{
//             opacity: 0,
//           }}
//           transition={{
//             duration: 0.3,
//           }}
//           className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col"
//           role="dialog"
//           aria-modal="true"
//           aria-label="Custom suit fitting wizard"
//         >
//           {/* Top Bar */}
//           <div className="shrink-0 border-b border-[#2e2e2e]">
//             <div className="flex items-center justify-between px-6 lg:px-10 h-16">
//               {/* Logo */}
//               <div>
//                 <div className="font-serif text-lg font-bold tracking-[0.15em] text-[#f5f0eb]">
//                   ELEVÉ
//                 </div>
//                 <div className="text-[#c9a96e] text-[8px] tracking-[0.4em] uppercase">
//                   Bespoke Tailoring
//                 </div>
//               </div>

//               {/* Step Progress */}
//               <div className="hidden md:flex items-center gap-0">
//                 {STEPS.map((step, i) => (
//                   <div key={step.id} className="flex items-center">
//                     <button
//                       onClick={() => {
//                         if (i < currentStep) {
//                           setDirection(-1);
//                           setCurrentStep(i);
//                         }
//                       }}
//                       disabled={i > currentStep}
//                       className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${i === currentStep ? "text-[#c9a96e]" : i < currentStep ? "text-[#9a9490] hover:text-[#f5f0eb] cursor-pointer" : "text-[#3a3a3a] cursor-default"}`}
//                     >
//                       <div
//                         className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${i < currentStep ? "bg-[#c9a96e] text-[#0f0f0f]" : i === currentStep ? "border-2 border-[#c9a96e] text-[#c9a96e]" : "border border-[#2e2e2e] text-[#3a3a3a]"}`}
//                       >
//                         {i < currentStep ? (
//                           <CheckIcon size={10} />
//                         ) : (
//                           step.shortLabel
//                         )}
//                       </div>
//                       <span className="text-[10px] tracking-[0.15em] uppercase font-medium">
//                         {step.label}
//                       </span>
//                     </button>
//                     {i < STEPS.length - 1 && (
//                       <div
//                         className={`w-8 h-px transition-colors duration-500 ${i < currentStep ? "bg-[#c9a96e]" : "bg-[#2e2e2e]"}`}
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* Mobile Step Indicator */}
//               <div className="md:hidden text-[#9a9490] text-xs tracking-[0.2em]">
//                 {currentStep + 1} / {STEPS.length}
//               </div>

//               {/* Close */}
//               <button
//                 onClick={handleClose}
//                 aria-label="Close fitting wizard"
//                 className="w-10 h-10 flex items-center justify-center border border-[#2e2e2e] text-[#9a9490] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200"
//               >
//                 <XIcon size={16} />
//               </button>
//             </div>

//             {/* Progress Bar */}
//             <div className="h-0.5 bg-[#1a1a1a]">
//               <motion.div
//                 className="h-full bg-[#c9a96e]"
//                 animate={{
//                   width: `${((currentStep + 1) / STEPS.length) * 100}%`,
//                 }}
//                 transition={{
//                   duration: 0.5,
//                   ease: "easeInOut",
//                 }}
//               />
//             </div>
//           </div>

//           {/* Main Content */}
//           {completed ? (
//             <motion.div
//               initial={{
//                 opacity: 0,
//                 scale: 0.95,
//               }}
//               animate={{
//                 opacity: 1,
//                 scale: 1,
//               }}
//               transition={{
//                 duration: 0.5,
//               }}
//               className="flex-1 flex items-center justify-center px-6"
//             >
//               <div className="text-center max-w-md">
//                 <motion.div
//                   initial={{
//                     scale: 0,
//                   }}
//                   animate={{
//                     scale: 1,
//                   }}
//                   transition={{
//                     type: "spring",
//                     stiffness: 200,
//                     delay: 0.2,
//                   }}
//                   className="w-16 h-16 border border-[#c9a96e] flex items-center justify-center mx-auto mb-8"
//                 >
//                   <CheckIcon size={28} className="text-[#c9a96e]" />
//                 </motion.div>
//                 <h2 className="font-serif text-3xl text-[#f5f0eb] font-bold mb-4">
//                   Order Confirmed
//                 </h2>
//                 <p className="text-[#9a9490] text-base leading-relaxed mb-8 font-light">
//                   Your bespoke suit is now in the hands of our master tailors.
//                   You'll receive a confirmation email within the hour.
//                 </p>
//                 <div className="flex items-center justify-center gap-2 text-[#c9a96e] text-sm mb-10">
//                   <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
//                   Estimated delivery: 14–18 working days
//                 </div>
//                 <button
//                   onClick={handleClose}
//                   className="bg-[#c9a96e] text-[#0f0f0f] px-10 py-4 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//                 >
//                   Back to Shop
//                 </button>
//               </div>
//             </motion.div>
//           ) : (
//             <div className="flex-1 flex overflow-hidden">
//               {/* Left Preview Panel */}
//               <div className="hidden lg:block w-[38%] xl:w-[42%] shrink-0 relative overflow-hidden">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={currentStep}
//                     initial={{
//                       opacity: 0,
//                       scale: 1.05,
//                     }}
//                     animate={{
//                       opacity: 1,
//                       scale: 1,
//                     }}
//                     exit={{
//                       opacity: 0,
//                       scale: 0.98,
//                     }}
//                     transition={{
//                       duration: 0.6,
//                     }}
//                     className="absolute inset-0"
//                   >
//                     <img
//                       src={PREVIEW_IMAGES[currentStep]}
//                       alt="Suit preview"
//                       className="w-full h-full object-cover object-top"
//                     />
//                     <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]/40" />
//                     <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/60 via-transparent to-transparent" />
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* Step label overlay */}
//                 <div className="absolute bottom-10 left-10">
//                   <AnimatePresence mode="wait">
//                     <motion.div
//                       key={currentStep}
//                       initial={{
//                         opacity: 0,
//                         y: 10,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                       }}
//                       exit={{
//                         opacity: 0,
//                         y: -10,
//                       }}
//                       transition={{
//                         duration: 0.4,
//                       }}
//                     >
//                       <div className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mb-2">
//                         Step {currentStep + 1} of {STEPS.length}
//                       </div>
//                       <h2 className="font-serif text-3xl text-[#f5f0eb] font-bold leading-tight">
//                         {STEP_TITLES[currentStep].title}
//                       </h2>
//                       <p className="text-[#9a9490] text-sm mt-2 font-light">
//                         {STEP_TITLES[currentStep].subtitle}
//                       </p>
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               </div>

//               {/* Right Content Panel */}
//               <div className="flex-1 flex flex-col overflow-hidden">
//                 {/* Mobile Step Title */}
//                 <div className="lg:hidden px-6 pt-8 pb-4 shrink-0">
//                   <div className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase mb-1">
//                     Step {currentStep + 1} of {STEPS.length}
//                   </div>
//                   <h2 className="font-serif text-2xl text-[#f5f0eb] font-bold">
//                     {STEP_TITLES[currentStep].title}
//                   </h2>
//                 </div>

//                 {/* Scrollable Step Content */}
//                 <div className="flex-1 overflow-y-auto px-6 lg:px-10 xl:px-14 py-8 lg:py-10">
//                   <AnimatePresence mode="wait" custom={direction}>
//                     <motion.div
//                       key={currentStep}
//                       custom={direction}
//                       variants={slideVariants}
//                       initial="enter"
//                       animate="center"
//                       exit="exit"
//                       transition={{
//                         duration: 0.35,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       {currentStep === 0 && <StepSuitStyle {...stepProps} />}
//                       {currentStep === 1 && <StepFabric {...stepProps} />}
//                       {currentStep === 2 && <StepDetails {...stepProps} />}
//                       {currentStep === 3 && <StepMeasurements {...stepProps} />}
//                       {/* {currentStep === 4 && <StepSummary {...stepProps} />} */}
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>

//                 {/* Bottom Navigation */}
//                 <div className="shrink-0 border-t border-[#2e2e2e] px-6 lg:px-10 xl:px-14 py-5">
//                   <div className="flex items-center justify-between">
//                     {/* Back */}
//                     <button
//                       onClick={goBack}
//                       disabled={currentStep === 0}
//                       className={`flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-200 ${currentStep === 0 ? "text-[#3a3a3a] cursor-default" : "text-[#9a9490] hover:text-[#f5f0eb]"}`}
//                     >
//                       <ArrowLeftIcon size={14} />
//                       Back
//                     </button>

//                     {/* Step Dots (mobile) */}
//                     <div className="flex gap-1.5 md:hidden">
//                       {STEPS.map((_, i) => (
//                         <div
//                           key={i}
//                           className={`h-1 transition-all duration-300 ${i === currentStep ? "w-6 bg-[#c9a96e]" : i < currentStep ? "w-3 bg-[#c9a96e]/50" : "w-3 bg-[#2e2e2e]"}`}
//                         />
//                       ))}
//                     </div>

//                     {/* Next / Complete */}
//                     {currentStep < STEPS.length - 1 ? (
//                       <button
//                         onClick={goNext}
//                         className="group flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//                       >
//                         Continue
//                         <ArrowRightIcon
//                           size={13}
//                           className="group-hover:translate-x-0.5 transition-transform duration-200"
//                         />
//                       </button>
//                     ) : (
//                       <button
//                         onClick={handleComplete}
//                         className="group flex items-center gap-3 bg-[#c9a96e] text-[#0f0f0f] px-8 py-3.5 text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#dfc08a] transition-colors duration-300"
//                       >
//                         <CheckIcon size={13} />
//                         Place Order
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
