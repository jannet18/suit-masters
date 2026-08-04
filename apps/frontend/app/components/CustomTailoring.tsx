"use client";

import { useEffect, useState, useMemo } from "react";
import { 

  Ruler, 
  Scissors, 
  
} from "lucide-react";

import {  FittingData, StepProps } from "@/lib/types";
import { api } from "@/lib/api/api-client";

// Standardizing structural metrics
export const STEPS = [
  { id: 0, label: "Style", short: "01", title: "Silhouette & Fit", subtitle: "Define your silhouette and structural drape profile" },
  { id: 1, label: "Fabric", short: "02", title: "Elite Fabrics", subtitle: "Select luxury cloths from standard-setting global weavers" },
  { id: 2, label: "Details", short: "03", title: "Premium Finishes", subtitle: "Personalize buttons, linings, and monogram signatures" },
  { id: 3, label: "Measurements", short: "04", title: "Precision Profiling", subtitle: "Enter measurements using our interactive sizing engine" },
  { id: 4, label: "Summary", short: "05", title: "Bespoke Ledger", subtitle: "Review final customization criteria and add to cart" }
];

// High-end curated presets designed to pre-fill the entire tailoring parameters matrix on a single click
export const CURATED_DESIGNS = [
  {
    id: "modern-executive",
    title: "The Modern Executive",
    description: "Sharp, contemporary styling for boardroom confidence.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=400&q=80",
    preset: {
      style: "Slim Fit",
      fit: "slim",
      fabric: "Navy Super 120s",
      fabricColor: "navy",
      lapel: "Notch Lapel",
      lining: "Burgundy Silk",
      buttons: "2",
      buttonColor: "Horn Buttons",
      monogram: { enabled: true, text: "EXEC" }
    }
  },
  {
    id: "wedding-classic",
    title: "The Wedding Classic",
    description: "Uncompromised formal elegance featuring Peak Lapels.",
    image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=400&q=80",
    preset: {
      style: "Double Breasted",
      fit: "regular",
      fabric: "Midnight Black",
      fabricColor: "midnight",
      lapel: "Peak Lapel",
      lining: "Silver Jacquard",
      buttons: "6",
      buttonColor: "Mother of Pearl",
      monogram: { enabled: true, text: "VOWS" }
    }
  },
  {
    id: "weekend-casual",
    title: "The Weekend Casual",
    description: "Relaxed sophistication for leisure moments, unstructured linen blend.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    preset: {
      style: "Unstructured Blazer",
      fit: "relaxed",
      fabric: "Charcoal Tweed",
      fabricColor: "charcoal",
      lapel: "Notch Lapel",
      lining: "Navy Cotton",
      buttons: "1",
      buttonColor: "Wooden Buttons",
      monogram: { enabled: true, text: "WEEK" }
    }
  }
];

export const colors: { id: string; label: string; hex: string }[] = [
  { id: "charcoal", label: "Charcoal", hex: "#3a3a3a" },
  { id: "navy", label: "Navy", hex: "#1a2744" },
  { id: "midnight", label: "Midnight Blue", hex: "#0d1b2a" },
  { id: "black", label: "Black", hex: "#0f0f0f" },
  { id: "grey", label: "Mid Grey", hex: "#6b6b6b" },
  { id: "brown", label: "Tobacco", hex: "#6b4c2a" },
  { id: "stone", label: "Stone", hex: "#c4b89a" },
  { id: "cream", label: "Ivory", hex: "#f5f0eb" }
];

export interface MeasurementField {
  key: keyof FittingData["measurements"];
  label: string;
  placeholder: string;
  hint: string;
  unit: string;
  videoUrl?: string;
  description?: string;
}

export interface MeasurementDefinition {
  id: number;
  bodyPart: string;
  displayName: string;
  description: string;
  videoUrl: string;
  displayOrder: number;
}

export const baseFields: MeasurementField[] = [
  { key: "height", label: "Height", placeholder: "180", hint: "Stand straight, measure from floor to top of head", unit: "cm" },
  { key: "chest", label: "Chest", placeholder: "100", hint: "Measure around the fullest part of your chest", unit: "cm" },
  { key: "waist", label: "Waist", placeholder: "86", hint: "Measure around your natural waistline", unit: "cm" },
  { key: "hips", label: "Seat", placeholder: "98", hint: "Measure around the fullest part of your seat", unit: "cm" },
  { key: "shoulder", label: "Shoulder Width", placeholder: "46", hint: "Measure from shoulder seam to shoulder seam", unit: "cm" },
  { key: "inseam", label: "Inseam", placeholder: "82", hint: "Measure from crotch to ankle along the inner leg", unit: "cm" }
];












