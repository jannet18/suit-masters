"use client";

import { formatCurrency } from "@repo/pricing";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDown,
  ChevronUp,
  Sparkle,
  Ruler,
  Scissors,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import { useConfiguratorStore } from "@/app/stores/useConfiguratorStore";
import {
  ConfigureProps,
  FittingData,
  StepProps,
  normalizeProduct,
  normalizeMeasurementDefinition,
} from "@/lib/types";
import { api } from "@/lib/api/api-client";
import { SuitViewer } from "./configurator/3d/SuitViewer";
import { IconOptionTile } from "./configurator/IconOptionTile";
import {
  LAPEL_ICON_BY_VALUE,
  POCKET_ICON_BY_VALUE,
  BUTTON_ICON_BY_VALUE,
} from "./configurator/OptionIcons";

/* ==================== SHARED CONSTANTS & TYPES ==================== */

// Standardizing structural metrics
export const STEPS = [
  {
    id: 0,
    label: "Style",
    short: "01",
    title: "Silhouette & Fit",
    subtitle: "Define your silhouette and structural drape profile",
  },
  {
    id: 1,
    label: "Fabric",
    short: "02",
    title: "Elite Fabrics",
    subtitle: "Select luxury cloths from standard-setting global weavers",
  },
  {
    id: 2,
    label: "Details",
    short: "03",
    title: "Premium Finishes",
    subtitle: "Personalize buttons, linings, and monogram signatures",
  },
  {
    id: 3,
    label: "Measurements",
    short: "04",
    title: "Precision Profiling",
    subtitle: "Enter measurements using our interactive sizing engine",
  },
  {
    id: 4,
    label: "Summary",
    short: "05",
    title: "Bespoke Ledger",
    subtitle: "Review final customization criteria and add to cart",
  },
];

// High-end curated presets designed to pre-fill the entire tailoring parameters matrix on a single click
export const CURATED_DESIGNS = [
  {
    id: "modern-executive",
    title: "The Modern Executive",
    description: "Sharp, contemporary styling for boardroom confidence.",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=400&q=80",
    preset: {
      style: "Slim Fit",
      fit: "slim",
      fabric: "Navy Super 120s",
      fabricColor: "navy",
      lapel: "Notch Lapel",
      lining: "Burgundy Silk",
      buttons: "2",
      buttonColor: "Horn Buttons",
      monogram: { enabled: true, text: "EXEC" },
    },
  },
  {
    id: "wedding-classic",
    title: "The Wedding Classic",
    description: "Uncompromised formal elegance featuring Peak Lapels.",
    image:
      "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=400&q=80",
    preset: {
      style: "Double Breasted",
      fit: "regular",
      fabric: "Midnight Black",
      fabricColor: "midnight",
      lapel: "Peak Lapel",
      lining: "Silver Jacquard",
      buttons: "6",
      buttonColor: "Mother of Pearl",
      monogram: { enabled: true, text: "VOWS" },
    },
  },
  {
    id: "weekend-casual",
    title: "The Weekend Casual",
    description:
      "Relaxed sophistication for leisure moments, unstructured linen blend.",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
    preset: {
      style: "Unstructured Blazer",
      fit: "relaxed",
      fabric: "Charcoal Tweed",
      fabricColor: "charcoal",
      lapel: "Notch Lapel",
      lining: "Navy Cotton",
      buttons: "1",
      buttonColor: "Wooden Buttons",
      monogram: { enabled: true, text: "WEEK" },
    },
  },
];

export const colors: { id: string; label: string; hex: string }[] = [
  { id: "charcoal", label: "Charcoal", hex: "#3a3a3a" },
  { id: "navy", label: "Navy", hex: "#1a2744" },
  { id: "midnight", label: "Midnight Blue", hex: "#0d1b2a" },
  { id: "black", label: "Black", hex: "#0f0f0f" },
  { id: "grey", label: "Mid Grey", hex: "#6b6b6b" },
  { id: "brown", label: "Tobacco", hex: "#6b4c2a" },
  { id: "stone", label: "Stone", hex: "#c4b89a" },
  { id: "cream", label: "Ivory", hex: "#f5f0eb" },
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
  {
    key: "height",
    label: "Height",
    placeholder: "180",
    hint: "Stand straight, measure from floor to top of head",
    unit: "cm",
  },
  {
    key: "chest",
    label: "Chest",
    placeholder: "100",
    hint: "Measure around the fullest part of your chest",
    unit: "cm",
  },
  {
    key: "waist",
    label: "Waist",
    placeholder: "86",
    hint: "Measure around your natural waistline",
    unit: "cm",
  },
  {
    key: "hips",
    label: "Seat",
    placeholder: "98",
    hint: "Measure around the fullest part of your seat",
    unit: "cm",
  },
  {
    key: "shoulder",
    label: "Shoulder Width",
    placeholder: "46",
    hint: "Measure from shoulder seam to shoulder seam",
    unit: "cm",
  },
  {
    key: "inseam",
    label: "Inseam",
    placeholder: "82",
    hint: "Measure from crotch to ankle along the inner leg",
    unit: "cm",
  },
];

/* ==================== 1. STYLE SELECTION STEP ==================== */
function StepSuitStyle({ data, onChange, product }: StepProps) {
  const stylesGroup = product?.customizationGroups?.find(
    (g: any) =>
      g.name.toLowerCase().includes("style") ||
      g.name.toLowerCase().includes("fit"),
  );

  // Shown only when the catalogue has no style options for this product.
  // They aren't catalogue options, so they carry no price (and none is charged).
  const fallbackStyles = [
    {
      name: "Slim Fit",
      desc: "Precision tapered cut closer to the body, emphasizing natural shoulders",
    },
    {
      name: "Classic Fit",
      desc: "Traditional clean drape providing supreme comfort and effortless mobility",
    },
    {
      name: "Double Breasted",
      desc: "Timeless 6-button front styling with elegant Peak Lapels",
    },
    {
      name: "Unstructured Blazer",
      desc: "Relaxed soft-shouldered canvas perfect for trans-seasonal smart casual layers",
    },
  ];

  if (!stylesGroup) {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Select Silhouette Drape
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fallbackStyles.map((s) => (
            <button
              key={s.name}
              onClick={() => onChange({ style: s.name })}
              className={`p-6 rounded-lg border text-left transition-all ${
                data.style === s.name
                  ? "border-[#c9a96e] bg-[#c9a96e]/5 text-[#f5f0eb]"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-serif font-bold text-lg">{s.name}</span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
        {stylesGroup.name}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stylesGroup.options?.map((opt: any) => (
          <button
            key={opt.id}
            onClick={() => onChange({ style: opt.value })}
            className={`p-6 rounded-lg border text-left transition-all ${
              data.style === opt.value
                ? "border-[#c9a96e] bg-[#c9a96e]/5 text-[#f5f0eb]"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-serif font-bold text-lg">{opt.value}</span>
              {opt.priceDelta > 0 && (
                <span className="text-xs font-mono text-[#c9a96e]">
                  +{formatCurrency(opt.priceDelta)}
                </span>
              )}
            </div>
            {opt.description && (
              <p className="text-xs leading-relaxed text-zinc-500">
                {opt.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ==================== 2. FABRIC SELECTION STEP ==================== */
function StepFabric({ data, onChange, product }: StepProps) {
  const fabricGroup = product?.customizationGroups?.find(
    (g: any) => g.name === "Fabric",
  );

  return (
    <div className="space-y-10">
      {/* Fabric Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
          Choose Your Fabric
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fabricGroup?.options?.map((opt: any) => {
            const label = opt.name || opt.value || "";
            const texture = opt.texture || "";
            const origin = opt.metadata?.origin || opt.factoryCode || "";
            const description = opt.metadata?.description || "";
            const price =
              opt.priceDelta > 0 ? `+ ${formatCurrency(opt.priceDelta)}` : "";

            return (
              <button
                key={opt.id}
                onClick={() => onChange({ fabric: opt.value })}
                className={`p-5 text-left border transition-all duration-200 ${
                  data.fabric === opt.value
                    ? "border-[#c9a96e] bg-[#c9a96e]/8"
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 shrink-0 ${texture} bg-zinc-800 border border-[#ffffff]/10 rounded`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-serif text-[#f5f0eb] text-sm font-semibold leading-snug truncate">
                        {label}
                      </div>
                      <span className="text-[#c9a96e] text-[11px] font-medium whitespace-nowrap">
                        {price}
                      </span>
                    </div>
                    {origin && (
                      <div className="text-[#9a9490] text-[10px] tracking-[0.15em] uppercase mb-2">
                        {origin}
                      </div>
                    )}
                    {description && (
                      <div className="text-[#9a9490] text-[11px] leading-relaxed line-clamp-2">
                        {description}
                      </div>
                    )}
                  </div>
                </div>
                {data.fabric === opt.value && (
                  <div className="mt-3 pt-3 border-t border-[#c9a96e]/20 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#c9a96e] rounded-full" />
                    <span className="text-[#c9a96e] text-[10px] tracking-[0.2em] uppercase">
                      Selected
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-4">
          Select Colour
        </h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ fabricColor: c.id })}
              title={c.label}
              className="group flex flex-col items-center gap-2 transition-all duration-200"
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                  data.fabricColor === c.id
                    ? "border-[#c9a96e] scale-110"
                    : "border-[#2e2e2e] hover:border-[#9a9490]"
                }`}
                style={{ backgroundColor: c.hex }}
              />
              <span
                className={`text-[10px] transition-colors duration-200 ${
                  data.fabricColor === c.id
                    ? "text-[#c9a96e]"
                    : "text-[#6b6560]"
                }`}
              >
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== 3. CUSTOM DETAILS STEP ==================== */
function StepDetails({ data, onChange, product }: StepProps) {
  const lapelGroup = product?.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("lapel"),
  );
  const pocketGroup = product?.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("pocket"),
  );
  const buttonGroup = product?.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("button"),
  );
  const liningGroup = product?.customizationGroups?.find((g: any) =>
    g.name.toLowerCase().includes("lining"),
  );

  return (
    <div className="space-y-10">
      {/* Lapel */}
      {lapelGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {lapelGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {lapelGroup.options?.map((l: any) => (
              <IconOptionTile
                key={l.id}
                label={l.value}
                priceDelta={l.priceDelta || 0}
                selected={data.lapel === l.value}
                onClick={() => onChange({ lapel: l.value })}
                icon={LAPEL_ICON_BY_VALUE[l.value]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pocket */}
      {pocketGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {pocketGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pocketGroup.options?.map((p: any) => (
              <IconOptionTile
                key={p.id}
                label={p.value}
                priceDelta={p.priceDelta || 0}
                selected={data.pocket === p.value}
                onClick={() => onChange({ pocket: p.value })}
                icon={POCKET_ICON_BY_VALUE[p.value]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Lining */}
      {liningGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {liningGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {liningGroup.options?.map((l: any) => (
              <button
                key={l.id}
                onClick={() => onChange({ lining: l.value })}
                className={`p-5 text-center border transition-all ${
                  data.lining === l.value
                    ? "border-[#c9a96e] bg-[#c9a96e]/8"
                    : "border-[#2e2e2e] hover:border-[#c9a96e]/30"
                }`}
              >
                <div className="font-serif text-[#f5f0eb] text-sm font-medium">
                  {l.value}
                </div>
                <div className="text-[#c9a96e] text-[10px] mt-1">
                  + {formatCurrency(l.priceDelta || 0)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button */}
      {buttonGroup && (
        <div>
          <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
            {buttonGroup.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {buttonGroup.options?.map((l: any) => (
              <IconOptionTile
                key={l.id}
                label={l.value}
                priceDelta={l.priceDelta || 0}
                selected={data.buttons === l.value}
                onClick={() => onChange({ buttons: l.value })}
                icon={BUTTON_ICON_BY_VALUE[l.value]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Monogram */}
      <div>
        <h3 className="font-sans text-[#9a9490] text-[10px] tracking-[0.3em] uppercase mb-5">
          Personal Monogram
        </h3>
        <div className="border border-white/10 bg-white/5 rounded-lg p-5">
          <input
            type="text"
            value={data.monogram}
            maxLength={12}
            placeholder="e.g. J.S.M"
            onChange={(e) => onChange({ monogram: e.target.value })}
            className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-[#f5f0eb] placeholder-[#3a3a3a] px-4 py-3 text-sm outline-none focus:border-[#c9a96e] transition-colors duration-200"
          />
          <p className="text-[#6b6560] text-[10px] mt-2 leading-snug">
            Up to 12 characters, embroidered inside the jacket. Leave blank for
            none.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ==================== 4. MEASUREMENTS STEP ==================== */
function StepMeasurements({ data, onChange }: StepProps) {
  const [measurementDefinitions, setMeasurementDefinitions] = useState<
    MeasurementDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<MeasurementField[]>(baseFields);
  const [unit, setUnit] = useState<"cm" | "in">(data.measurements.unit);

  useEffect(() => {
    async function fetchMeasurementDefinitions() {
      try {
        setLoading(true);
        const result = await api.getMeasurementDefinitions();

        if (result?.success && result.definitions) {
          const normalized = result.definitions.map(
            normalizeMeasurementDefinition,
          );
          setMeasurementDefinitions(normalized);

          const enhancedFields = baseFields.map((field) => {
            const definition = normalized.find((def: MeasurementDefinition) => {
              const bodyPartMatch =
                def.bodyPart?.toLowerCase() === field.key.toLowerCase();
              const displayNameMatch = def.displayName
                ?.toLowerCase()
                .includes(field.key.toLowerCase());
              const keyInDisplayName = field.key
                .toLowerCase()
                .includes(def.displayName?.toLowerCase() || "");
              return bodyPartMatch || displayNameMatch || keyInDisplayName;
            });

            return {
              ...field,
              videoUrl: definition?.videoUrl || "",
              description: definition?.description || field.hint,
            };
          });

          setFields(enhancedFields);
        } else {
          setFields(baseFields);
        }
      } catch (error) {
        console.error("Error fetching measurement definitions:", error);
        setFields(baseFields);
      } finally {
        setLoading(false);
      }
    }

    fetchMeasurementDefinitions();
  }, []);

  const handleMeasurementChange = (
    key: keyof FittingData["measurements"],
    value: string,
  ) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    onChange({
      measurements: {
        ...data.measurements,
        [key]: numValue,
      },
    });
  };

  const toggleUnit = () => {
    const next = unit === "cm" ? "in" : "cm";
    setUnit(next);
    onChange({ measurements: { ...data.measurements, unit: next } });
  };

  const renderVideoGuide = (field: MeasurementField) => {
    if (!field.videoUrl) return null;

    return (
      <div className="mb-4">
        <div className="relative rounded-lg overflow-hidden bg-black/20 aspect-video">
          <video
            src={field.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-[#9a9490] text-xs mt-2">{field.description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-5 border border-[#c9a96e]/20 bg-[#c9a96e]/5">
        <div className="w-8 h-8 border border-[#c9a96e]/40 flex items-center justify-center shrink-0 mt-0.5">
          <Ruler size={14} className="text-[#c9a96e]" />
        </div>
        <div className="flex-1">
          <div className="font-serif text-[#f5f0eb] text-sm font-medium mb-1">
            Measuring Guide
          </div>
          <p className="text-[#9a9490] text-xs leading-relaxed">
            For the most accurate fit, measure in your underwear with a soft
            tape measure. Ask a friend to help for best results.
          </p>
          {loading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border border-[#c9a96e] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#9a9490] text-xs">
                Loading dynamic video guides...
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleUnit}
          className="shrink-0 px-3 py-1.5 border border-[#c9a96e]/40 text-[#c9a96e] text-[10px] tracking-widest uppercase hover:bg-[#c9a96e]/10 transition-colors"
        >
          {unit === "cm" ? "CM" : "IN"}
        </button>
      </div>

      <div className="space-y-8">
        {fields.map((field) => (
          <div key={field.key} className="group border-b border-white/5 pb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/2">
                {renderVideoGuide(field)}
                {!field.videoUrl && !loading && (
                  <div className="rounded-lg bg-black/20 aspect-video flex items-center justify-center">
                    <div className="text-center p-4">
                      <Scissors className="w-8 h-8 text-[#3a3a3a] mx-auto mb-2" />
                      <p className="text-[#6b6560] text-xs">
                        Video guide coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-1/2 flex flex-col justify-center">
                <label
                  htmlFor={`measurement-${field.key}`}
                  className="block text-[#9a9490] text-[10px] tracking-[0.25em] uppercase mb-2 group-focus-within:text-[#c9a96e] transition-colors duration-200 font-medium"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={`measurement-${field.key}`}
                    type="number"
                    value={data.measurements[field.key] || ""}
                    onChange={(e) =>
                      handleMeasurementChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                    min="0"
                    step="0.5"
                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-[#f5f0eb] placeholder-[#3a3a3a] px-4 py-3.5 pr-12 text-sm outline-none focus:border-[#c9a96e] transition-colors duration-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9490] text-xs font-mono">
                    {unit}
                  </span>
                </div>
                <p className="text-[#6b6560] text-[10px] mt-1.5 leading-snug">
                  {field.hint}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <button className="text-[#c9a96e] text-xs tracking-[0.2em] uppercase hover:text-[#dfc08a] transition-colors duration-200 underline underline-offset-4">
          Not sure? Use our size guide →
        </button>
      </div>
    </div>
  );
}

/* ==================== 5. ORDER SUMMARY STEP ==================== */
function StepSummary({ data, totalPrice, product, basePrice }: StepProps) {
  const getUpgradeDetails = () => {
    const items = [];

    if (data.style) {
      items.push({ label: "Design Silhouette Style", val: data.style });
    }
    if (data.fabric) {
      items.push({
        label: "Bespoke Outer Fabric",
        val: `${data.fabric} (${data.fabricColor || "Default"})`,
      });
    }
    if (data.lapel) {
      items.push({ label: "Internal Lapel Structuring", val: data.lapel });
    }
    if (data.pocket) {
      items.push({ label: "Pocket Styling", val: data.pocket });
    }
    if (data.lining) {
      items.push({ label: "Sartorial Body Lining", val: data.lining });
    }
    if (data.buttons) {
      items.push({
        label: "Front Sleeve Button Set",
        val: `${data.buttons} Button Set`,
      });
    }
    if (data.buttonColor) {
      items.push({ label: "Button Material", val: data.buttonColor });
    }
    if (data.monogram) {
      items.push({ label: "Personal Monogram", val: data.monogram });
    }
    return items;
  };

  const totalSurcharges = (totalPrice ?? 0) - (basePrice ?? 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-white/5 rounded-lg p-6 divide-y divide-white/5">
        <h3 className="font-serif font-bold text-lg pb-4 text-[#f5f0eb]">
          Bespoke Technical Specifications
        </h3>

        <div className="py-4 space-y-3 text-xs">
          {getUpgradeDetails().map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-baseline gap-4 py-0.5"
            >
              <span className="text-zinc-500">{item.label}</span>
              <span className="text-[#f5f0eb] font-mono">{item.val}</span>
            </div>
          ))}
        </div>

        <div className="py-4 space-y-2 text-xs">
          <div className="flex justify-between text-[#9a9490]">
            <span>Physiological Sizing Measurements</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#c9a96e]">
              Locked to Account
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded font-mono text-zinc-400 text-[10px]">
            <div>
              Height: {data.measurements.height} {data.measurements.unit}
            </div>
            <div>
              Chest: {data.measurements.chest} {data.measurements.unit}
            </div>
            <div>
              Waist: {data.measurements.waist} {data.measurements.unit}
            </div>
            <div>
              Hips: {data.measurements.hips} {data.measurements.unit}
            </div>
            <div>
              Inseam: {data.measurements.inseam} {data.measurements.unit}
            </div>
            <div>
              Shoulder: {data.measurements.shoulder} {data.measurements.unit}
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#9a9490]">Base Tailoring</span>
            <span className="text-[#f5f0eb] font-mono">
              {formatCurrency(basePrice ?? 0)}
            </span>
          </div>
          {totalSurcharges > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#9a9490]">Premium Upgrades</span>
              <span className="text-[#f5f0eb] font-mono">
                +{formatCurrency(totalSurcharges)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-[#9a9490] flex items-center gap-2">
              Insured Global Shipping
            </span>
            <span className="text-[#c9a96e] uppercase text-[10px] font-bold">
              Complimentary
            </span>
          </div>
        </div>

        <div className="pt-4 flex justify-between items-baseline">
          <span className="font-bold text-sm text-[#f5f0eb] uppercase tracking-wider">
            Total Investment
          </span>
          <span className="font-mono text-3xl font-bold text-[#c9a96e]">
            {formatCurrency(totalPrice ?? 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==================== MAIN STUDIO CONFIGURATOR ==================== */
export function BespokeConfigurator({ slug }: ConfigureProps) {
  const router = useRouter();
  const { addToCart, globalMeasurements, setGlobalMeasurements } =
    useCartStore();

  const fittingData = useConfiguratorStore((s) => s.selections);
  const setConfiguratorSelections = useConfiguratorStore((s) => s.setSelections);
  const currentStep = useConfiguratorStore((s) => s.activeStep);
  const setCurrentStep = useConfiguratorStore((s) => s.setActiveStep);
  const resetConfigurator = useConfiguratorStore((s) => s.reset);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Seed the shared configurator store with this product's starting
  // measurements (carried over from the shopper's saved profile, if any).
  useEffect(() => {
    resetConfigurator({
      style: "",
      fit: "",
      fabric: "",
      fabricColor: "navy",
      lapel: "",
      pocket: "",
      lining: "",
      buttons: "2",
      monogram: "",
      buttonColor: "",
      measurements: {
        unit: "cm" as const,
        height: globalMeasurements.height || 0,
        chest: globalMeasurements.chest || 0,
        waist: globalMeasurements.waist || 0,
        hips: globalMeasurements.hips || 0,
        inseam: globalMeasurements.inseam || 0,
        shoulder: globalMeasurements.shoulder || 0,
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, []);

  useEffect(() => {
    async function init() {
      const pSlug = typeof slug === "string" ? slug : (slug as any).slug;
      if (!pSlug) return;
      try {
        const res = await api.getProductBySlug(pSlug);
        if (res?.success && res.product) {
          const normalized = normalizeProduct(res.product);
          setProduct(normalized);
          const initialData: Partial<FittingData> = {};
          normalized.customizationGroups?.forEach((g: any) => {
            const firstOpt = g.options?.[0]?.value || "";
            if (g.name.toLowerCase().includes("style"))
              initialData.style = firstOpt;
            if (g.name.toLowerCase().includes("fabric"))
              initialData.fabric = firstOpt;
            if (g.name.toLowerCase().includes("lapel"))
              initialData.lapel = firstOpt;
            if (g.name.toLowerCase().includes("pocket"))
              initialData.pocket = firstOpt;
            if (g.name.toLowerCase().includes("lining"))
              initialData.lining = firstOpt;
            if (g.name.toLowerCase().includes("button"))
              initialData.buttons = firstOpt;
          });
          setConfiguratorSelections(initialData);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    // Integer pence: base price plus each chosen option's delta
    let price = product.basePrice || 0;

    const checkOptionDelta = (value: string) => {
      if (!product.customizationGroups) return 0;
      for (const g of product.customizationGroups) {
        const matched = g.options?.find((o: any) => o.value === value);
        if (matched) return matched.priceDelta || 0;
      }
      return 0;
    };

    price += checkOptionDelta(fittingData.style);
    price += checkOptionDelta(fittingData.fabric);
    price += checkOptionDelta(fittingData.lapel);
    price += checkOptionDelta(fittingData.pocket);
    price += checkOptionDelta(fittingData.lining);
    price += checkOptionDelta(fittingData.buttons);

    return price;
  }, [product, fittingData]);

  const findOptionByValue = (value: string) => {
    if (!product?.customizationGroups) return null;
    for (const group of product.customizationGroups) {
      const found = group.options?.find((opt: any) => opt.value === value);
      if (found) return { option: found, group };
    }
    return null;
  };

  const handleCuratedDesignSelect = (designId: string) => {
    const design = CURATED_DESIGNS.find((d) => d.id === designId);
    if (design) {
      setActiveDesign(designId);
      const preset: any = design.preset || {};
      const monogram =
        typeof preset.monogram === "object"
          ? (preset.monogram.text ?? fittingData.monogram)
          : (preset.monogram ?? fittingData.monogram);

      setConfiguratorSelections({ ...preset, monogram });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedOptions: Array<{
      id: number;
      group_id: number;
      label: string;
      price_impact: number;
      factory_code?: string;
    }> = [];
    const keys: (keyof FittingData)[] = [
      "style",
      "fabric",
      "fabricColor",
      "lapel",
      "pocket",
      "lining",
      "buttons",
      "buttonColor",
    ];

    keys.forEach((key, index) => {
      const val = fittingData[key];
      if (typeof val === "string" && val) {
        const match = findOptionByValue(val);
        selectedOptions.push({
          id: match?.option.id ?? Date.now() + index,
          group_id: match?.group.id ?? index + 1,
          label: val,
          price_impact: match?.option.priceDelta ?? 0,
          factory_code: match?.option.factoryCode ?? undefined,
        });
      }
    });

    const cartItem = {
      id: product.id,
      productId: product.id,
      name: `Bespoke ${product.name}`,
      basePrice: product.basePrice,
      imageUrl:
        typeof product?.productImage === "string"
          ? product?.productImage
          : product?.productImage?.default || "",
      productType: "CUSTOM" as const,
      quantity: 1,
      selectedOptions,
      configuration: {
        selections: selectedOptions,
        measurements: fittingData.measurements,
        monogram: fittingData.monogram || undefined,
      },
      totalPrice,
    };

    addToCart(cartItem);
    router.push("/cart");
  };

  const handleChange = (updates: Partial<FittingData>) => {
    setConfiguratorSelections(updates);
    if (updates.measurements) {
      const { unit, ...numericOnly } = updates.measurements;
      setGlobalMeasurements(numericOnly);
    }
  };

  const stepProps: StepProps | null = product
    ? {
        data: fittingData,
        onChange: handleChange,
        product,
        basePrice: product?.basePrice || 0,
        totalPrice,
      }
    : null;

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#0f0f0f] flex flex-col gap-4 items-center justify-center text-[#c9a96e] font-mono tracking-widest text-xs">
        <Sparkle className="animate-spin text-[#c9a96e]" />
        LAUNCHING TAILORING STUDIO...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col font-sans text-[#f5f0eb] select-none">
      {/* Top Header Panel */}
      <header className="h-16 shrink-0 border-b border-white/5 bg-[#0d0d0d] flex items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-10">
        <div className="flex flex-col">
          <span className="font-serif tracking-widest text-base font-bold text-[#f5f0eb] sm:text-lg">
            SUIT MASTERS
          </span>
          <span className="text-[9px] text-[#c9a96e] uppercase tracking-[0.3em] font-light mt-0.5">
            Custom Sizing Studio
          </span>
        </div>

        {/* Dynamic Nav Stepper */}
        <nav className="hidden xl:flex items-center gap-8">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-2.5 text-[10px] tracking-[0.25em] uppercase transition-all cursor-pointer ${
                idx === currentStep
                  ? "text-[#c9a96e] font-semibold"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full border text-[9px] flex items-center justify-center transition-all ${
                  idx <= currentStep
                    ? "border-[#c9a96e] text-[#c9a96e]"
                    : "border-zinc-800 text-zinc-600"
                }`}
              >
                {idx < currentStep ? <CheckIcon size={10} /> : s.short}
              </span>
              {s.label}
            </div>
          ))}
        </nav>

        <button
          onClick={() => router.back()}
          className="p-2.5 border border-white/5 hover:border-[#c9a96e]/40 rounded-full transition-colors bg-white/5 text-zinc-400 hover:text-white"
        >
          <XIcon size={16} />
        </button>
      </header>

      {/* Main Studio Splitted Viewport */}
      <div className="min-h-0 flex-1 grid grid-cols-1 grid-rows-[minmax(12rem,30svh)_minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-1">
        <section className="contents lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-white/5 lg:bg-[#0b0b0b]">
          <div className="h-full min-h-0 overflow-hidden border-b border-white/5 lg:h-[48vh] lg:max-h-[620px] lg:min-h-[360px] lg:shrink-0">
            <SuitViewer />
          </div>

          {/* Parallax Ambience */}
          <div className="relative hidden h-48 shrink-0 overflow-hidden border-b border-white/5 lg:block">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80"
              className="w-full h-full object-cover opacity-25 filter grayscale"
              alt=""
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0b] to-transparent" />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="text-[#c9a96e] text-[9px] tracking-[0.3em] uppercase block mb-1">
                Design Studio
              </span>
              <h2 className="font-serif text-2xl font-bold">
                Curated Starting Looks
              </h2>
            </div>
          </div>

          <div className="hidden flex-1 space-y-4 p-6 lg:block">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Skip configuring from scratch. Choose a master style below crafted
              by our tailoring directors to automatically pre-fill details.
            </p>

            <div className="space-y-3">
              {CURATED_DESIGNS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleCuratedDesignSelect(d.id)}
                  className={`w-full p-4 rounded-lg border text-left flex gap-4 transition-all ${
                    activeDesign === d.id
                      ? "border-[#c9a96e] bg-[#c9a96e]/5"
                      : "border-white/5 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-white/5">
                    <img
                      src={d.image}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-serif font-bold text-sm text-[#f5f0eb]">
                        {d.title}
                      </h4>
                      {activeDesign === d.id && (
                        <span className="text-[9px] font-mono text-[#c9a96e] uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                      {d.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quote Block */}
            <div className="pt-6 border-t border-white/5 text-center">
              <p className="font-serif italic text-xs text-[#c9a96e]/60">
                "A customized fit represents character, precision, and personal
                standard."
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Step customizer panel (Indochino) */}
        <section className="flex min-h-0 min-w-0 flex-col bg-[#0f0f0f]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10">
            <div className="max-w-2xl mx-auto">
              <header className="mb-6 sm:mb-10">
                <span className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase font-semibold">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
                <h2 className="mt-1 text-2xl font-serif font-bold text-[#f5f0eb] sm:text-3xl">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed">
                  {STEPS[currentStep].subtitle}
                </p>
              </header>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {stepProps && (
                    <>
                      {currentStep === 0 && <StepSuitStyle {...stepProps} />}
                      {currentStep === 1 && <StepFabric {...stepProps} />}
                      {currentStep === 2 && <StepDetails {...stepProps} />}
                      {currentStep === 3 && <StepMeasurements {...stepProps} />}
                      {currentStep === 4 && <StepSummary {...stepProps} />}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Technical Details Progressive Disclosure */}
          <div className="border-t border-white/5 bg-[#0d0d0d]/40">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full border-b border-white/5 px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors sm:px-6 lg:px-12"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-[#c9a96e] text-xs">
                  ⚙️
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400">
                  Advanced Specifications Details
                </span>
              </div>
              {showTechnicalDetails ? (
                <ChevronUp size={14} className="text-[#c9a96e]" />
              ) : (
                <ChevronDown size={14} className="text-zinc-500" />
              )}
            </button>

            <AnimatePresence>
              {showTechnicalDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#121212]"
                >
                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                        Canvas Construction
                      </div>
                      <div className="font-semibold text-[#f5f0eb]">
                        Half-Canvas Standard
                      </div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                        Shoulder Padding
                      </div>
                      <div className="font-semibold text-[#f5f0eb]">
                        Soft Neapolitan Profile
                      </div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                        Undercollar Melton
                      </div>
                      <div className="font-semibold text-[#f5f0eb]">
                        Color-Matched Felt
                      </div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">
                        Sleeve Buttonholes
                      </div>
                      <div className="font-semibold text-[#f5f0eb]">
                        Working Surgeon's Cuffs
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Footer Controllers */}
          <footer className="h-20 shrink-0 border-t border-white/5 bg-[#0a0a0a] px-3 flex items-center justify-between sm:h-24 sm:px-6 lg:px-12">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-white disabled:opacity-0 transition-all font-semibold"
            >
              <ArrowLeftIcon size={14} /> Back
            </button>

            <div className="mr-2 text-right sm:mr-4">
              <span className="hidden text-[9px] uppercase tracking-widest text-zinc-600 sm:block">
                Active Price Est.
              </span>
              <span className="font-mono text-sm font-bold text-[#c9a96e] sm:text-lg">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentStep === STEPS.length - 1) {
                  handleAddToCart();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              className="h-11 rounded bg-[#c9a96e] px-4 text-[9px] font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-[#dfc08a] flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] sm:h-12 sm:px-8 sm:text-[10px] sm:tracking-[0.25em] lg:px-10"
            >
              {currentStep === STEPS.length - 1 ? "Add to Cart" : "Continue"}
              <ArrowRightIcon size={14} />
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
