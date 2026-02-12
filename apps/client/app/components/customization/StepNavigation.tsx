"use client";

import React from "react";

interface StepNavigationProps {
  steps: string[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  // onNext?: () => void;
  // onPrev?: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  setCurrentStep,
}) => {
  return (
    // <div>
    //   <button onClick={() => setCurrentStep((prev ) => currentStep - 1)} disabled={currentStep === 1}>
    //     Previous
    //   </button>

    //   </button>
    //   <span>
    //     Step {currentStep} of {totalSteps}
    //   </span>
    //   <button onClick={onNext} disabled={currentStep >= totalSteps}>
    //     Next
    //   </button>
    // </div>
    <div>
      <button
        onClick={() => setCurrentStep((prev) => prev - 1)}
        disabled={currentStep === 0}
      >
        Previous
      </button>

      <span>
        {steps[currentStep]} ({currentStep + 1} / {steps.length})
      </span>

      <button
        onClick={() => setCurrentStep((prev) => prev + 1)}
        disabled={currentStep === steps.length - 1}
      >
        Next
      </button>
    </div>
  );
};

export default StepNavigation;
