import { FittingData, StepProps } from "@/lib/types";

interface MeasurementField {
  key: keyof FittingData["measurements"];
  label: string;
  placeholder: string;
  hint: string;
  unit: string;
}
const fields: MeasurementField[] = [
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
  const handleMeasurementChange = (
    key: keyof FittingData["measurements"],
    value: string,
  ) => {
    onChange({
      measurements: {
        ...data.measurements,
        [key]: value,
      },
    });
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
        </div>
      </div>

      {/* Measurement Fields */}
      <div className="grid grid-cols-2 gap-5">
        {fields.map((field) => (
          <div key={field.key} className="group">
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
