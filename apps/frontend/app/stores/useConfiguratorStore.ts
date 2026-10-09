"use client";

import { create } from "zustand";
import type { FittingData } from "@/lib/types";

/**
 * Single source of truth for the bespoke configurator's selections. Both the
 * 2D step UI (Configurator.tsx) and the 3D viewport read/write this store,
 * so a change made in either place is reflected in the other — e.g. picking
 * "Peak Lapel" in the step list updates the 3D model, and (eventually)
 * clicking a lapel directly on the 3D model updates the step list.
 */
interface ConfiguratorStore {
  selections: FittingData;
  /** Index into Configurator.tsx's STEPS array; drives camera focus in the 3D view. */
  activeStep: number;
  setSelections: (updates: Partial<FittingData>) => void;
  setActiveStep: (step: number) => void;
  reset: (initial: FittingData) => void;
}

export const DEFAULT_SELECTIONS: FittingData = {
  style: "",
  fit: "",
  fabric: "",
  fabricColor: "navy",
  lapel: "",
  pocket: "",
  lining: "",
  buttons: "2",
  buttonColor: "",
  monogram: "",
  measurements: {
    unit: "cm",
    height: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    inseam: 0,
    shoulder: 0,
  },
};

export const useConfiguratorStore = create<ConfiguratorStore>((set) => ({
  selections: DEFAULT_SELECTIONS,
  activeStep: 0,
  setSelections: (updates) =>
    set((state) => ({ selections: { ...state.selections, ...updates } })),
  setActiveStep: (step) => set({ activeStep: step }),
  reset: (initial) => set({ selections: initial, activeStep: 0 }),
}));
