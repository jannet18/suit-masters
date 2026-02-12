"use client";

import React from "react";
// import { CartItem } from "@/app/lib/types";

interface SuitVisualizerProps {
  // item: CartItem;
  selectedOptions: Record<number, number>;
  imageUrl: string;
}

const SuitVisualizer: React.FC<SuitVisualizerProps> = ({
  selectedOptions,
  imageUrl,
}) => {
  return (
    <div>
      <h3>Suit Visualizer</h3>
      <pre>{JSON.stringify(selectedOptions, null, 2)}</pre>
      <img src={imageUrl} alt="Custom Suit Preview" />
    </div>
  );
};

export default SuitVisualizer;
