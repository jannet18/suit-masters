"use client";
import { LifestyleLayout } from "../components/LifestyleLayout";

const page = ({ selections, setSelections }: any) => {
  // const [selections, setSelections] = useState()
  return (
    <>
      <LifestyleLayout
        children
        productName="Bespoke Midnight Suit"
        currentStep={0}
        totalSteps={5}
        selections={selections} // Your state object
        onSelectionChange={setSelections} // Your state setter
        onClose={() => console.log("Close")}
      >
        {/* The children content goes here */}
        {/* <StepContent /> */}
      </LifestyleLayout>{" "}
    </>
  );
};
export default page;
