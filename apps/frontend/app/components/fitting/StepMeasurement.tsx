import { useState, useEffect } from "react";
import { FittingData, StepProps } from "@/lib/types";
import { api } from "@/lib/api/api-client";

interface MeasurementField {
  key: keyof FittingData["measurements"];
  label: string;
  placeholder: string;
  hint: string;
  unit: string;
  videoUrl?: string;
  description?: string;
}

interface MeasurementDefinition {
  id: number;
  bodyPart: string;
  displayName: string;
  description: string;
  videoUrl: string;
  displayOrder: number;
}

const baseFields: MeasurementField[] = [
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

export function StepMeasurements({ data, onChange }: StepProps) {
  const [measurementDefinitions, setMeasurementDefinitions] = useState<
    MeasurementDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<MeasurementField[]>(baseFields);

  useEffect(() => {
    async function fetchMeasurementDefinitions() {
      try {
        setLoading(true);
        const result = await api.getMeasurementDefinitions();
        console.log("Measurement definitions API result:", result);

        if (result.success && result.definitions) {
          setMeasurementDefinitions(result.definitions);

          // Enhance fields with video URLs and descriptions from API
          const enhancedFields = baseFields.map((field) => {
            const definition = result.definitions.find(
              (def: MeasurementDefinition) => {
                const bodyPartMatch =
                  def.bodyPart?.toLowerCase() === field.key.toLowerCase();
                const displayNameMatch = def.displayName
                  ?.toLowerCase()
                  .includes(field.key.toLowerCase());
                const keyInDisplayName = field.key
                  .toLowerCase()
                  .includes(def.displayName?.toLowerCase() || "");

                console.log(`Field ${field.key}:`, {
                  bodyPart: def.bodyPart,
                  displayName: def.displayName,
                  bodyPartMatch,
                  displayNameMatch,
                  keyInDisplayName,
                });

                return bodyPartMatch || displayNameMatch || keyInDisplayName;
              },
            );

            const enhancedField = {
              ...field,
              videoUrl: definition?.videoUrl || "",
              description: definition?.description || field.hint,
            };

            console.log(`Enhanced field ${field.key}:`, {
              hasVideoUrl: !!enhancedField.videoUrl,
              videoUrl: enhancedField.videoUrl,
              description: enhancedField.description,
            });

            return enhancedField;
          });

          console.log("Enhanced fields:", enhancedFields);
          setFields(enhancedFields);
        } else {
          console.warn(
            "No measurement definitions found in API response:",
            result,
          );
          // Keep using base fields without video URLs
          setFields(baseFields);
        }
      } catch (error) {
        console.error("Error fetching measurement definitions:", error);
        // Keep using base fields on error
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

  // Function to render video guide for a field
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
            onLoadStart={() => console.log(`Loading video for ${field.label}`)}
            onLoadedData={() => console.log(`Video loaded for ${field.label}`)}
          >
            Your browser does not support the video tag.
          </video>
          {/* Loading overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-[#9a9490] text-xs mt-2">{field.description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="flex items-start gap-4 p-5 border border-[#c9a96e]/20 bg-[#c9a96e]/5">
        <div className="w-8 h-8 border border-[#c9a96e]/40 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#c9a96e" strokeWidth="1" />
            <path
              d="M7 6v4M7 4.5v.5"
              stroke="#c9a96e"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div className="font-serif text-[#f5f0eb] text-sm font-medium mb-1">
            Measuring Guide
          </div>
          <p className="text-[#9a9490] text-xs leading-relaxed">
            For the most accurate fit, measure in your underwear with a soft
            tape measure. Ask a friend to help for best results. All
            measurements in centimetres.
          </p>
          {loading && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border border-[#c9a96e] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#9a9490] text-xs">
                Loading video guides...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Fields with Video Guides */}
      <div className="space-y-8">
        {fields.map((field) => (
          <div key={field.key} className="group">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Video Guide - Above on mobile, left on desktop */}
              <div className="lg:w-1/2">
                {renderVideoGuide(field)}
                {!field.videoUrl && !loading && (
                  <div className="rounded-lg bg-black/20 aspect-video flex items-center justify-center">
                    <div className="text-center p-4">
                      <svg
                        className="w-12 h-12 text-[#3a3a3a] mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-[#6b6560] text-xs">
                        Video guide coming soon
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Field - Below on mobile, right on desktop */}
              <div className="lg:w-1/2">
                <label
                  htmlFor={`measurement-${field.key}`}
                  className="block text-[#9a9490] text-[10px] tracking-[0.25em] uppercase mb-2 group-focus-within:text-[#c9a96e] transition-colors duration-200"
                >
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={`measurement-${field.key}`}
                    type="number"
                    value={data.measurements[field.key]}
                    onChange={(e) =>
                      handleMeasurementChange(field.key, e.target.value)
                    }
                    placeholder={field.placeholder}
                    min="0"
                    step="0.5"
                    className="w-full bg-[#1a1a1a] border border-[#2e2e2e] text-[#f5f0eb] placeholder-[#3a3a3a] px-4 py-3.5 pr-12 text-sm outline-none focus:border-[#c9a96e] transition-colors duration-200 appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9490] text-xs">
                    {field.unit}
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

      {/* Size Guide Link */}
      <div className="text-center pt-2">
        <button className="text-[#c9a96e] text-xs tracking-[0.2em] uppercase hover:text-[#dfc08a] transition-colors duration-200 underline underline-offset-4">
          Not sure? Use our size guide →
        </button>
      </div>
    </div>
  );
}
