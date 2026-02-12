"use client";

import React, { useState } from "react";

interface MeasurementStepProps {
  measurements: Record<string, number>;
  setMeasurements: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const MeasurementStep: React.FC<MeasurementStepProps> = ({
  measurements,
  setMeasurements,
}) => {
  const handleChange = (field: string, value: number) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <h3>Measurement Step</h3>
      {Object.entries(measurements).map(([key, value]) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(key, Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
};

export default MeasurementStep;
