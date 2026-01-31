"use client";
import { SelectedOptions } from "@/app/lib/types";
import React from "react";

interface Props {
  selectedOptions: SelectedOptions;
}

const SuitVisualizer: React.FC<Props> = ({ selectedOptions }) => {
  const getSuitImage = () => {
    const { style, lapel } = selectedOptions;
    if (style === "single-breasted" && lapel === "peak") {
      return "https://images.unsplash.com/photo-1593032465175-481ac7f401f0?auto=format&fit=crop&w=800&q=80";
    } else if (style === "double-breasted") {
      return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="aspect-3/4 relative rounded-md overflow-hidden bg-gray-50">
        <img
          src={getSuitImage()}
          alt="Custom Suit Preview"
          className="w-full h-full object-cover"
        />
        {selectedOptions.fabric?.pattern && (
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url(${selectedOptions.fabric.pattern})`,
              backgroundSize: "50px 50px",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SuitVisualizer;
