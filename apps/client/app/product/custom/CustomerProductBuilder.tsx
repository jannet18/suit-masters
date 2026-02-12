// "use client";

// import StepNavigation from "@/app/components/customization/StepNavigation";
// import Details from "@/app/components/customization/steps/Detail";
// import FabricStep from "@/app/components/customization/steps/Fabric";
// import MeasurementStep from "@/app/components/customization/steps/Measurement";
// import ReviewStep from "@/app/components/customization/steps/Review";
// import Style from "@/app/components/customization/steps/Style";
// import SuitVisualizer from "@/app/components/SuitVisualizer";
// import { CustomizationGroup } from "@/app/lib/types";
// import { useCartStore } from "@/app/stores/cartStore";
// import { useState } from "react";

// interface Props {
//   product: any;
// }

// export default function CustomProductBuilder({ product }: Props) {
//   // const { addCustomItem } = useCartStore();

//   const [step, setStep] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState<
//     Record<number, number>
//   >({});
//   const [measurements, setMeasurements] = useState({});

//   const steps = ["Fabric", "Style", "Details", "Measurements", "Review"];

//   const calculatePrice = () => {
//     let base = product.price;

//     product.groups.forEach((group: CustomizationGroup, i: number) => {
//       const selectedItemId = selectedOptions[group.id];
//       const item = group.items?.find((i) => i.id === selectedItemId);
//       if (item?.price_delta) {
//         base += item.price_delta;
//       }
//     });

//     return base;
//   };

//   // const handleAddToCart = () => {
//   //   addCustomItem({
//   //     product_type: "CUSTOM",
//   //     id: product.id,
//   //     name: product.name,
//   //     image_url: product.image,
//   //     quantity: 1,
//   //     base_price: calculatePrice(),
//   //     selected_options: Object.entries(selectedOptions).map(
//   //       ([groupId, itemId]) => {
//   //         const group = product.groups.find(
//   //           (g: CustomizationGroup) => g.id === parseInt(groupId),
//   //         );
//   //         const item = group?.items?.find((i: any) => i.id === itemId);
//   //         return {
//   //           id: itemId,
//   //           group_id: parseInt(groupId),
//   //           label: item?.value || "",
//   //           price_impact: item?.price_delta ? item.price_delta.toString() : "0",
//   //         };
//   //       },
//   //     ),
//   //     // measurements,
//   //   });
//   // };

//   const renderStep = () => {
//     switch (step) {
//       case 0:
//         return (
//           <FabricStep
//             groups={product.groups}
//             selectedOptions={selectedOptions}
//             setSelectedOptions={setSelectedOptions}
//           />
//         );
//       case 1:
//         return (
//           <Style
//             groups={product.groups}
//             selectedOptions={selectedOptions}
//             setSelectedOptions={setSelectedOptions}
//           />
//         );
//       case 2:
//         return (
//           <Details
//             groups={product.groups}
//             selectedOptions={selectedOptions}
//             setSelectedOptions={setSelectedOptions}
//           />
//         );
//       case 3:
//         return (
//           <MeasurementStep
//             measurements={measurements}
//             setMeasurements={setMeasurements}
//           />
//         );
//       case 4:
//         return (
//           <ReviewStep
//             selectedOptions={selectedOptions}
//             measurements={measurements}
//             total={calculatePrice()}
//           />
//         );
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <div className="w-1/2 bg-gray-100 p-6">
//         <SuitVisualizer
//           selectedOptions={selectedOptions}
//           imageUrl={product.image.default || ""}
//         />
//       </div>

//       <div className="w-1/2 p-8">
//         <StepNavigation
//           steps={steps}
//           currentStep={step}
//           setCurrentStep={setStep}
//         />

//         <div className="mt-8">{renderStep()}</div>

//         <div className="mt-10 flex justify-between">
//           <button
//             disabled={step === 0}
//             onClick={() => setStep(step - 1)}
//             className="border px-6 py-2"
//           >
//             Back
//           </button>

//           {step < steps.length - 1 ? (
//             <button
//               onClick={() => setStep(step + 1)}
//               className="bg-black text-white px-6 py-2"
//             >
//               Next
//             </button>
//           ) : (
//             <button
//               onClick={handleAddToCart}
//               className="bg-black text-white px-6 py-2"
//             >
//               Add Custom Suit
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
