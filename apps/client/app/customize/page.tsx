// "use client";
// import CustomizationOptions from "../components/CustomizationOptions";
// import CustomizationSteps from "../components/customize/CustomizationSteps";
// import { useState } from "react";
// import { SelectedOptions } from "../lib/types";

// // const myOptions: SelectedOptions = {
// //   style: "slim",
// //   lapel: "notch",
// //   vents: "double",
// //   pockets: "flap",
// //   // ... plus the 2 other missing properties
// // };

// // interface SelectedOptions {
// //   style?: string;
// //   lapel?: string;
// //   vents?: string;
// //   pockets?: string;
// //   // ...
// // }

// // // Now this works without errors:
// // const myOptions: SelectedOptions = {};

// const CustomizePage = () => {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
//     style: "single-breasted",
//     lapel: "notch",
//     vents: "double",
//     pockets: "flap",
//     fabric: null, // or a default fabric object
//     buttons: "two-button",
//     lining: "solid",
//   });

//   const handleOptionChange = (option: string, value: string) => {
//     setSelectedOptions({ ...selectedOptions, [option]: value });
//   };

//   return (
//     <>
//       <CustomizationSteps
//         steps={[]}
//         currentStep={step}
//         setCurrentStep={setStep}
//       />
//       <CustomizationOptions
//         step={step}
//         selectedOptions={selectedOptions}
//         onOptionChange={handleOptionChange}
//       />
//     </>
//   );
// };
// export default CustomizePage;

"use client";
import React, { useState } from "react";
import CustomizationOptions from "../components/CustomizationOptions";
import CustomizationSteps from "../components/customize/CustomizationSteps";
// import SuitVisualizer from "../components/SuitVisualizer"; // Added this
import { SelectedOptions, Step } from "../lib/types";
import SuitVisualizer from "../components/customize/SuitVisualizer";
import { steps } from "../lib/optionData";
// import { steps } from "../lib/stepsData"; // Ensure you have your steps array defined

const CustomizePage = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // FIX: Cast the initial state to SelectedOptions or Partial<SelectedOptions>
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    fabric: null,
    style: "single-breasted", // Default values matching your UI
    lapel: "notch",
    buttons: "two-button",
    vents: "double",
    pockets: "flap",
    lining: "solid-silk",
    monogram: "",
  });

  const handleOptionChange = (category: keyof SelectedOptions, value: any) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [category]: value,
    }));
  };
  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 1. Progress Bar at the top */}
      <CustomizationSteps
        steps={steps}
        currentStep={currentStepIndex}
        setCurrentStep={setCurrentStepIndex}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* 2. Visual Preview (Left/Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <SuitVisualizer selectedOptions={selectedOptions} />
          </div>
        </div>

        {/* 3. Options Selection (Right) */}
        <div className="lg:col-span-2">
          <CustomizationOptions
            step={currentStep}
            // steps={steps[currentStepIndex]}
            selectedOptions={selectedOptions}
            onOptionChange={handleOptionChange}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-top pt-6">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => setCurrentStepIndex((prev) => prev - 1)}
              className="px-6 py-2 border rounded-md disabled:opacity-30"
            >
              Back
            </button>
            <button
              onClick={() =>
                setCurrentStepIndex((prev) =>
                  Math.min(prev + 1, steps.length - 1),
                )
              }
              className="px-6 py-2 bg-amber-600 text-white rounded-md"
            >
              {currentStepIndex === steps.length - 1
                ? "Review Order"
                : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;
