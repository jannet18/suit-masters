"use client";

import { useEffect } from "react";
import { CameraControls } from "@react-three/drei";
import type { RefObject } from "react";

/**
 * [camPos, lookAt] pairs, keyed by Configurator.tsx's STEPS index. There's
 * no separate "lapel tab" vs "button tab" in the real step UI (both live
 * under the single "Details" step), so both focus on the chest — the area
 * that step actually edits — rather than fabricating tabs that don't exist.
 */
const STEP_FOCUS: Array<{ position: [number, number, number]; target: [number, number, number] }> = [
  { position: [0, 1.1, 2.3], target: [0, 0.55, 0] }, // 0 Style — full silhouette
  { position: [0, 0.9, 1.7], target: [0, 0.55, 0] }, // 1 Fabric — closer, reads texture/drape
  { position: [0, 0.85, 0.95], target: [0, 0.78, 0.25] }, // 2 Details — lapel/button/pocket chest area
  { position: [0, 1.1, 2.3], target: [0, 0.2, 0] }, // 3 Measurements — full body, lower bias
  { position: [0, 1.0, 2.0], target: [0, 0.5, 0] }, // 4 Summary — hero framing
];

interface CameraRigProps {
  activeStep: number;
  controlsRef: RefObject<CameraControls | null>;
}

export function CameraRig({ activeStep, controlsRef }: CameraRigProps) {
  useEffect(() => {
    const focus = STEP_FOCUS[activeStep] ?? STEP_FOCUS[0]!;
    controlsRef.current?.setLookAt(
      ...focus.position,
      ...focus.target,
      true, // animate the transition
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={1.2}
      maxDistance={4.0}
      maxPolarAngle={Math.PI / 2}
      dollySpeed={0.5}
    />
  );
}
