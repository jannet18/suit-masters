"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/api-client";
import { useCartStore } from "@/app/stores/useCartStore";
import { ConfigureProps, FittingData, StepProps } from "@/lib/types";

const initialFittingData: FittingData = {
  style: "",
  fit: "",
  fabric: "",
  fabricColor: "",
  lapel: "",
  lining: "",
  buttons: "2",
  buttonColor: "",
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
export function BespokeConfigurator({ slug, isOpen, onClose }: ConfigureProps) {
  const router = useRouter();
  const { addToCart, globalMeasurements, setGlobalMeasurements } =
    useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [fittingData, setFittingData] =
    useState<FittingData>(initialFittingData);
  const [selections, setSelections] = useState<Record<number, any>>({});
  const [measurements, setMeasurements] =
    useState<Record<string, number>>(globalMeasurements);

  useEffect(() => {
    async function init() {
      if (!slug) return;
      setLoading(true);
      const res = await api.getProductBySlug(slug);
      if (res.success) {
        setProduct(res.product);
        // Default: Select the first option for every group automatically
        const defaults: Record<number, any> = {};
        res.product.customizationGroups.forEach((group: any) => {
          if (group.options?.length > 0) defaults[group.id] = group.options[0];
        });
        setSelections(defaults);
      } else {
        router.push("/collections");
      }
      setLoading(false);
    }
    init();
  }, [slug]);

  // Dynamic Price Calculation
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let extra = 0;
    product.customizationGroups?.forEach((group: any) => {
      const userValue = (fittingData as any)[group.name.toLowerCase()];
      const match = group.options.find((opt: any) => opt.value === userValue);
      if (match) extra += parseFloat(match.price_delta);
    });
    return parseFloat(product.base_price) + extra;
  }, [product, fittingData]);

  const stepProps: StepProps = {
    data: fittingData,
    onChange: (updates) => setFittingData((prev) => ({ ...prev, ...updates })),
    product: product,
    basePrice: parseFloat(product?.base_price),
    totalPrice: Number(totalPrice),
  };

  // Logic: Steps = All DB Groups + 1 Final Measurement Step
  const totalSteps = (product?.customizationGroups?.length || 0) + 1;
  const isMeasurementStep =
    currentStep === product?.customizationGroups?.length;
  const handleMeasurementChange = (key: string, value: number) => {
    const updated = { ...measurements, [key]: value };
    setMeasurements(updated);
    setGlobalMeasurements(updated); // Sync to persistence
  };
  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      id: Date.now(),
      productId: product.id,
      name: `Bespoke ${product.name}`,
      base_price: parseFloat(product.base_price),
      totalPrice: totalPrice,
      quantity: 1,
      product_type: "CUSTOM" as const,
      image_url:
        typeof product.product_image === "string"
          ? product.product_image
          : product.product_image?.default || "",
      // We send the full snapshot to the cart
      configuration: {
        selections: Object.values(selections),
        measurements: globalMeasurements,
      },
    };
    addToCart(cartItem);
    router.push("/cart");
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
        LOADING STUDIO...
      </div>
    );

  const currentGroup = product?.customizationGroups[currentStep];

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col text-[#f5f0eb]">
      {/* Header with Progress */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold italic">Suit Masters</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a96e]">
            {product?.name} / Step {currentStep + 1}
          </p>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-6 rounded-full transition-colors ${i <= currentStep ? "bg-[#c9a96e]" : "bg-white/10"}`}
            />
          ))}
        </div>
        <button onClick={() => router.back()}>
          <XIcon size={20} />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Visualizer Panel */}
        <div className="w-1/2 bg-[#151515] flex items-center justify-center p-12 relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentStep}
              src={
                typeof product?.product_image === "string"
                  ? product?.product_image
                  : product?.product_image?.default || ""
              } // In real world, swap with selection image
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-h-full object-contain"
            />
          </AnimatePresence>
          <div className="absolute bottom-10 left-10">
            <p className="text-[#c9a96e] text-xs uppercase tracking-widest mb-1">
              Current Price
            </p>
            <p className="text-3xl font-serif">£{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        {/* Selection Panel */}
        <div className="w-1/2 p-12 flex flex-col border-l border-white/5">
          <div className="flex-1 overflow-y-auto">
            {!isMeasurementStep ? (
              <>
                <h2 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e] mb-6">
                  Select {currentGroup?.name}
                </h2>
                <div className="grid gap-4">
                  {currentGroup &&
                    currentGroup.options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          setSelections({
                            ...selections,
                            [currentGroup.id]: option,
                          })
                        }
                        className={`p-6 border text-left flex justify-between items-center transition-all ${selections[currentGroup.id]?.id === option.id ? "border-[#c9a96e] bg-[#c9a96e]/5" : "border-white/10"}`}
                      >
                        <div>
                          <span className="font-medium">{option.value}</span>
                          <span className="text-xs text-[#9a9490]">
                            {parseFloat(
                              option.priceDelta || option.price_delta || 0,
                            ) > 0
                              ? `+ £${option.priceDelta || option.price_delta}`
                              : "Included"}
                          </span>
                        </div>
                        {selections[currentGroup.id]?.id === option.id && (
                          <CheckIcon size={16} className="text-[#c9a96e]" />
                        )}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <h2 className="text-xs uppercase tracking-[0.4em] text-[#c9a96e]">
                  Measurements (cm)
                </h2>
                {Object.keys(measurements).map((key) => (
                  <div key={key} className="border-b border-white/10 pb-2">
                    <label className="text-[10px] uppercase text-[#555] block">
                      {key}
                    </label>
                    <input
                      type="number"
                      className="bg-transparent w-full outline-none py-2 text-xl"
                      value={measurements[key]}
                      onChange={(e) =>
                        handleMeasurementChange(key, Number(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <footer className="pt-8 border-t border-white/10 flex justify-between">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest disabled:opacity-30"
            >
              <ArrowLeftIcon size={14} /> Back
            </button>
            <button
              onClick={
                isMeasurementStep
                  ? handleAddToCart
                  : () => setCurrentStep((s) => s + 1)
              }
              className="bg-[#c9a96e] text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#b8985d] transition-colors"
            >
              {isMeasurementStep ? "Add to Wardrobe" : "Next Detail"}{" "}
              <ArrowRightIcon size={14} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
