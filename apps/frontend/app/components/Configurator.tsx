"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// Import your custom Step Components
import { StepSuitStyle } from "./fitting/StepSuitStyle";
import { StepFabric } from "./fitting/StepFabric";
import { StepDetails } from "./fitting/StepDetails";
import { StepSummary } from "./fitting/StepSummary";
import { api } from "@/lib/api/api-client";
import { useCartStore } from "@/app/stores/useCartStore";
import { ConfigureProps, FittingData, StepProps } from "@/lib/types";
import { StepMeasurements } from "./fitting/StepMeasurement";

const STEPS = [
  {
    id: 0,
    label: "Style",
    short: "01",
    title: "Choose Your Style",
    subtitle: "Select the silhouette that defines you",
  },
  {
    id: 1,
    label: "Fabric",
    short: "02",
    title: "Select Your Fabric",
    subtitle: "The finest materials from around the world",
  },
  {
    id: 2,
    label: "Details",
    short: "03",
    title: "Personalise Details",
    subtitle: "Every detail tells your story",
  },
  {
    id: 3,
    label: "Measurements",
    short: "04",
    title: "Precision Fit",
    subtitle: "Precision tailored to your exact proportions",
  },
  {
    id: 4,
    label: "Summary",
    short: "05",
    title: "Final Review",
    subtitle: "Your bespoke suit, ready to be crafted",
  },
];

export function BespokeConfigurator({ slug }: ConfigureProps) {
  const router = useRouter();
  const { addToCart, globalMeasurements, setGlobalMeasurements } =
    useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [fittingData, setFittingData] = useState<FittingData>({
    style: "",
    fit: "",
    fabric: "",
    fabricColor: "",
    lapel: "",
    lining: "",
    buttons: "2",
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
  });

  useEffect(() => {
    async function init() {
      const pSlug = typeof slug === "string" ? slug : (slug as any).slug;
      if (!pSlug) return;
      try {
        const res = await api.getProductBySlug(pSlug);
        if (res?.success) setProduct(res.product);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    // Calculation logic matching your StepSummary
    return parseFloat(product.base_price) || 0;
  }, [product, fittingData]);

  /** Look up a customization option by its value field across all groups */
  const findOptionByValue = (value: string) => {
    if (!product?.customizationGroups) return null;
    for (const group of product.customizationGroups) {
      const found = group.options?.find((opt: any) => opt.value === value);
      if (found) return { option: found, group };
    }
    return null;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Convert fittingData selections to selected_options format
    // using real DB option IDs from product.customizationGroups
    const selectedOptions: any[] = [];

    // Map style selection
    if (fittingData.style) {
      const match = findOptionByValue(fittingData.style);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 1,
        group_id: match?.group.id ?? 1,
        label: fittingData.style,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map fabric selection
    if (fittingData.fabric) {
      const match = findOptionByValue(fittingData.fabric);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 2,
        group_id: match?.group.id ?? 2,
        label: fittingData.fabric,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map fabric color selection
    if (fittingData.fabricColor) {
      const match = findOptionByValue(fittingData.fabricColor);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 3,
        group_id: match?.group.id ?? 3,
        label: fittingData.fabricColor,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map lapel selection
    if (fittingData.lapel) {
      const match = findOptionByValue(fittingData.lapel);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 4,
        group_id: match?.group.id ?? 4,
        label: fittingData.lapel,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map lining selection
    if (fittingData.lining) {
      const match = findOptionByValue(fittingData.lining);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 5,
        group_id: match?.group.id ?? 5,
        label: fittingData.lining,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map buttons selection
    if (fittingData.buttons) {
      const match = findOptionByValue(fittingData.buttons);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 6,
        group_id: match?.group.id ?? 6,
        label: `${fittingData.buttons}-button`,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Map button color selection
    if (fittingData.buttonColor) {
      const match = findOptionByValue(fittingData.buttonColor);
      selectedOptions.push({
        id: match?.option.id ?? Date.now() + 7,
        group_id: match?.group.id ?? 7,
        label: fittingData.buttonColor,
        price_impact: match?.option.priceDelta?.toString() ?? "0",
      });
    }

    // Create cart item
    const cartItem = {
      id: product.id,
      productId: product.id,
      name: `Bespoke ${product.name}`,
      base_price: product.base_price.toString(),
      totalPrice: totalPrice,
      quantity: 1,
      product_type: "CUSTOM" as const,
      image_url:
        typeof product?.product_image === "string"
          ? product?.product_image
          : product?.product_image?.default || "",
      selected_options: selectedOptions,
      configuration: {
        selections: selectedOptions,
        measurements: fittingData.measurements,
      },
    };

    console.log("Adding custom product to cart:", cartItem);
    addToCart(cartItem);
    router.push("/cart");
  };

  const handleChange = (updates: Partial<FittingData>) => {
    setFittingData((prev) => ({ ...prev, ...updates }));
    if (updates.measurements) {
      // Extract numeric measurements only (excluding unit which is a string)
      const { unit, ...numericMeasurements } = updates.measurements;
      setGlobalMeasurements(numericMeasurements);
    }
  };

  // Only create stepProps if product is loaded
  const stepProps: StepProps | null = product
    ? {
        data: fittingData,
        onChange: handleChange,
        product: product,
        basePrice: parseFloat(product?.base_price || 0),
        totalPrice: totalPrice,
      }
    : null;

  const renderStepContent = () => {
    if (!stepProps) return null;

    switch (currentStep) {
      case 0:
        return <StepSuitStyle {...stepProps} />;
      case 1:
        return <StepFabric {...stepProps} />;
      case 2:
        return <StepDetails {...stepProps} />;
      case 3:
        return <StepMeasurements {...stepProps} />;
      case 4:
        return <StepSummary {...stepProps} />;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0f0f0f] flex items-center justify-center text-[#c9a96e]">
        LOADING...
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] flex flex-col font-sans text-[#f5f0eb]">
      {/* Top Navigation Bar */}
      <header className="shrink-0 border-b border-white/5 h-20 flex items-center justify-between px-10">
        <div className="font-serif tracking-widest text-xl">SUIT MASTERS</div>

        <nav className="hidden md:flex items-center gap-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase transition-colors ${i === currentStep ? "text-[#c9a96e]" : "text-zinc-600"}`}
            >
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center ${i <= currentStep ? "border-[#c9a96e]" : "border-zinc-800"}`}
              >
                {i < currentStep ? <CheckIcon size={12} /> : s.short}
              </span>
              {s.label}
            </div>
          ))}
        </nav>

        <button
          onClick={() => router.back()}
          className="p-2 border border-white/10 hover:border-[#c9a96e] transition-colors"
        >
          <XIcon size={20} />
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Visualizer Panel (Left) */}
        <section className="hidden lg:block w-[40%] relative bg-[#0a0a0a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img
                src={product?.product_image}
                className="w-full h-full object-cover opacity-60"
                alt="Suit"
              />
              <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0f0f0f]" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-16 left-16">
            <span className="text-[#c9a96e] text-[10px] tracking-[0.5em] uppercase">
              Total Cost
            </span>
            <h2 className="text-4xl font-serif mt-2">
              £ {totalPrice.toFixed(2)}
            </h2>
          </div>
        </section>

        {/* Selection Panel (Right) */}
        <section className="flex-1 flex flex-col bg-[#0f0f0f] border-l border-white/5">
          <div className="flex-1 overflow-y-auto px-8 lg:px-20 py-12">
            <div className="max-w-2xl mx-auto">
              <header className="mb-12">
                <span className="text-[#c9a96e] text-[10px] tracking-[0.4em] uppercase">
                  Step {currentStep + 1}
                </span>
                <h2 className="text-3xl font-serif mt-2">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-zinc-500 text-sm mt-2">
                  {STEPS[currentStep].subtitle}
                </p>
              </header>
              {renderStepContent()}
            </div>
          </div>

          <footer className="h-24 border-t border-white/5 flex items-center justify-between px-8 lg:px-20 bg-[#0d0d0d]">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-zinc-500 hover:text-white disabled:opacity-0 transition-all"
            >
              <ArrowLeftIcon size={16} /> Back
            </button>
            <button
              onClick={() =>
                currentStep === STEPS.length - 1
                  ? handleAddToCart()
                  : setCurrentStep((s) => s + 1)
              }
              className="bg-[#c9a96e] text-black px-12 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all"
            >
              {currentStep === STEPS.length - 1 ? "Add to Cart" : "Continue"}{" "}
              <ArrowRightIcon size={16} className="ml-2 inline" />
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
}
