"use client";

import { Html, useProgress } from "@react-three/drei";

export function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-[#c9a96e]">
        <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.2em] uppercase font-mono">
          {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}
