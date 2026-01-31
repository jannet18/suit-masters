"use client";
import React, { Fragment } from "react";
import type { Step } from "@/lib/types";

interface Props {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (index: number) => void;
}

const CustomizationSteps: React.FC<Props> = ({
  steps,
  currentStep,
  setCurrentStep,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <Fragment key={step.id}>
            <button
              onClick={() => setCurrentStep(index)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium relative z-10 transition-colors duration-300 ${
                index <= currentStep
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-500 border border-gray-300"
              }`}
            >
              {index < currentStep ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-gray-300">
                <div
                  className="h-full bg-amber-600 transition-all duration-300"
                  style={{
                    width:
                      index < currentStep
                        ? "100%"
                        : index === currentStep
                        ? "50%"
                        : "0%",
                  }}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="flex justify-between px-1">
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={`text-xs font-medium ${
              index <= currentStep ? "text-amber-600" : "text-gray-500"
            }`}
          >
            {step.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CustomizationSteps;
