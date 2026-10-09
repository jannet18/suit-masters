"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Environment } from "@react-three/drei";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useConfiguratorStore } from "@/app/stores/useConfiguratorStore";
import { colors } from "../../Configurator";
import { SuitModel } from "./SuitModel";
import { PlaceholderSuit } from "./PlaceholderSuit";
import { ModelErrorBoundary } from "./ModelErrorBoundary";
import { Loader } from "./Loader";
import { CameraRig } from "./CameraRig";

/** Preset azimuth angles (radians) the </> buttons step through — front,
 * three-quarter, side, back — rather than requiring a click-drag to explore
 * the garment, matching how Hockerty's configurator offers quick angle
 * jumps alongside full manual orbiting. */
const PRESET_AZIMUTHS = [0, Math.PI / 4, Math.PI / 2, Math.PI];
const ANGLE_LABELS = ["Front", "Three-quarter", "Side", "Back"];

/**
 * 360° product viewport for the bespoke configurator. Reads selections
 * straight from useConfiguratorStore so it stays in sync with the step UI
 * without any prop plumbing through BespokeConfigurator.
 */
export function SuitViewer() {
  const selections = useConfiguratorStore((s) => s.selections);
  const activeStep = useConfiguratorStore((s) => s.activeStep);
  const controlsRef = useRef<CameraControls | null>(null);
  const [angleIndex, setAngleIndex] = useState(0);

  const fabricHex = useMemo(
    () => colors.find((c) => c.id === selections.fabricColor)?.hex ?? "#1a2744",
    [selections.fabricColor],
  );

  const cycleAngle = (direction: 1 | -1) => {
    const next = (angleIndex + direction + PRESET_AZIMUTHS.length) % PRESET_AZIMUTHS.length;
    setAngleIndex(next);
    const controls = controlsRef.current;
    if (!controls) return;
    controls.rotateTo(PRESET_AZIMUTHS[next]!, controls.polarAngle, true);
  };

  return (
    <div className="relative w-full h-full bg-linear-to-b from-[#161616] to-[#0a0a0a]">
      <Canvas shadows camera={{ position: [0, 1.1, 2.3], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[2, 5, 2]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-2, 2, -2]} intensity={0.3} />

        <Suspense fallback={<Loader />}>
          <ModelErrorBoundary
            fallback={
              <PlaceholderSuit
                fabricColorId={selections.fabricColor}
                lapelCode={selections.lapel}
                pocketCode={selections.pocket}
                buttonCode={selections.buttons}
              />
            }
          >
            <SuitModel
              fabricHex={fabricHex}
              lapelCode={selections.lapel}
              pocketCode={selections.pocket}
              buttonCode={selections.buttons}
            />
          </ModelErrorBoundary>
          <Environment preset="studio" />
        </Suspense>

        <CameraRig activeStep={activeStep} controlsRef={controlsRef} />
      </Canvas>

      <button
        type="button"
        onClick={() => cycleAngle(-1)}
        aria-label="Previous angle"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#f5f0eb] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => cycleAngle(1)}
        aria-label="Next angle"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/30 text-[#f5f0eb] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.25em] uppercase text-[#6b6560]">
        {ANGLE_LABELS[angleIndex]} · Drag to rotate · Scroll to zoom
      </p>
    </div>
  );
}
