// "use client";
// import CustomizationOptions from "../components/CustomizationOptions";
// import CustomizationSteps from "../components/customize/CustomizationSteps";
// import { useState } from "react";

// const CustomizePage = () => {
//   const [step, setStep] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState({});

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
//       <CustomizationOptions step={step} selectedOptions={selectedOptions} onOptionChange={handleOptionChange} />
//     </>
//   );
// };
// export default CustomizePage;
