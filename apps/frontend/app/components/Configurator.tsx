"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckIcon, 
  ChevronDown, 
  ChevronUp, 
  Sparkle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import { ConfigureProps, FittingData, StepProps } from "@/lib/types";
import { api } from "@/lib/api/api-client";
import { CURATED_DESIGNS, STEPS } from "./CustomTailoring";
import { StepSuitStyle } from "./fitting/StepSuitStyle";
import { StepFabric } from "./fitting/StepFabric";
import { StepDetails } from "./fitting/StepDetails";
import { StepMeasurements } from "./fitting/StepMeasurement";
import { StepSummary } from "./fitting/StepSummary";
// import { CURATED_DESIGNS, StepDetails, StepFabric, StepMeasurements, STEPS, StepSuitStyle, StepSummary } from "./CustomTailoring";

/* ==================== MAIN STUDIO CONFIGURATOR ==================== */
export function BespokeConfigurator({ slug }: ConfigureProps) {
  const router = useRouter();
  const { addToCart, globalMeasurements, setGlobalMeasurements } = useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeDesign, setActiveDesign] = useState<string | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const [fittingData, setFittingData] = useState<FittingData>({
    style: "",
    fit: "",
    fabric: "",
    fabricColor: "navy",
    lapel: "",
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
    }
  });

  useEffect(() => {
    async function init() {
      const pSlug = typeof slug === "string" ? slug : (slug as any).slug;
      if (!pSlug) return;
      try {
        const res = await api.getProductBySlug(pSlug);
        if (res?.success && res.product) {
          setProduct(res.product);
          // Set default option selections matching API customization structures
          const initialData: Partial<FittingData> = {};
          res.product.customizationGroups?.forEach((g: any) => {
            const firstOpt = g.options?.[0]?.value || "";
            if (g.name.toLowerCase().includes("style")) initialData.style = firstOpt;
            if (g.name.toLowerCase().includes("fabric")) initialData.fabric = firstOpt;
            if (g.name.toLowerCase().includes("lapel")) initialData.lapel = firstOpt;
            if (g.name.toLowerCase().includes("lining")) initialData.lining = firstOpt;
          });
          setFittingData((prev) => ({ ...prev, ...initialData }));
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [slug]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    let price = parseFloat(product.base_price) || 0;

    // Compile dynamic price impacts of dynamic customization options selections
    const checkOptionDelta = (value: string) => {
      if (!product.customizationGroups) return 0;
      for (const g of product.customizationGroups) {
        const matched = g.options?.find((o: any) => o.value === value);
        if (matched) return parseFloat(matched.priceDelta || matched.price_delta || 0);
      }
      return 0;
    };

    price += checkOptionDelta(fittingData.style);
    price += checkOptionDelta(fittingData.fabric);
    price += checkOptionDelta(fittingData.lapel);
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
      setFittingData((prev) => {
        // design.preset may contain fields that don't exactly match FittingData types
        const preset: any = design.preset || {};
        // normalize monogram: FittingData.monogram is expected to be a string
        const monogram = typeof preset.monogram === 'object'
          ? (preset.monogram.text ?? prev.monogram)
          : (preset.monogram ?? prev.monogram);

        return {
          ...prev,
          ...preset,
          monogram,
        } as FittingData;
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedOptions: any[] = [];
    const keys: (keyof FittingData)[] = ["style", "fabric", "fabricColor", "lapel", "lining", "buttons", "buttonColor"];
    
    keys.forEach((key, index) => {
      const val = fittingData[key];
      if (typeof val === "string" && val) {
        const match = findOptionByValue(val);
        selectedOptions.push({
          id: match?.option.id ?? Date.now() + index,
          group_id: match?.group.id ?? index + 1,
          label: val,
          price_impact: match?.option.priceDelta?.toString() ?? "0",
        });
      }
    });

    const cartItem = {
      id: product.id,
      productId: product.id,
      name: `Bespoke ${product.name}`,
      basePrice: product.base_price.toString(),
      imageUrl: typeof product?.product_image === "string" 
        ? product?.product_image 
        : product?.product_image?.default || "",
      productType: "CUSTOM" as const,
      quantity: 1,
      selectedOptions,
      configuration: {
        selections: selectedOptions,
        measurements: fittingData.measurements,
      },
      totalPrice: totalPrice.toString()
    };

    addToCart(cartItem);
    router.push("/cart");
  };

  const handleChange = (updates: Partial<FittingData>) => {
    setFittingData((prev) => ({ ...prev, ...updates }));
    if (updates.measurements) {
      const { unit, ...numericOnly } = updates.measurements;
      setGlobalMeasurements(numericOnly);
    }
  };

  const stepProps: StepProps | null = product ? {
    data: fittingData,
    onChange: handleChange,
    product,
    basePrice: parseFloat(product?.base_price || 0),
    totalPrice
  } : null;

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
      <header className="shrink-0 border-b border-white/5 h-20 flex items-center justify-between px-6 lg:px-10 bg-[#0d0d0d]">
        <div className="flex flex-col">
          <span className="font-serif tracking-widest text-lg font-bold text-[#f5f0eb]">SUIT MASTERS</span>
          <span className="text-[9px] text-[#c9a96e] uppercase tracking-[0.3em] font-light mt-0.5">Custom Sizing Studio</span>
        </div>

        {/* Dynamic Nav Stepper */}
        <nav className="hidden xl:flex items-center gap-8">
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center gap-2.5 text-[10px] tracking-[0.25em] uppercase transition-all cursor-pointer ${
                idx === currentStep ? "text-[#c9a96e] font-semibold" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <span className={`w-5 h-5 rounded-full border text-[9px] flex items-center justify-center transition-all ${
                idx <= currentStep ? "border-[#c9a96e] text-[#c9a96e]" : "border-zinc-800 text-zinc-600"
              }`}>
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
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Curated Editorial Presets Panel (Hockerty) */}
        <section className="hidden lg:flex w-[35%] flex-col bg-[#0b0b0b] border-r border-white/5 overflow-y-auto">
          {/* Parallax Ambience */}
          <div className="relative h-48 shrink-0 overflow-hidden border-b border-white/5">
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
              <h2 className="font-serif text-2xl font-bold">Curated Starting Looks</h2>
            </div>
          </div>

          <div className="p-6 flex-1 space-y-4">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Skip configuring from scratch. Choose a master style below crafted by our tailoring directors to automatically pre-fill details.
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
                    <img src={d.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-serif font-bold text-sm text-[#f5f0eb]">{d.title}</h4>
                      {activeDesign === d.id && (
                        <span className="text-[9px] font-mono text-[#c9a96e] uppercase tracking-wider">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">{d.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quote Block */}
            <div className="pt-6 border-t border-white/5 text-center">
              <p className="font-serif italic text-xs text-[#c9a96e]/60">
                "A customized fit represents character, precision, and personal standard."
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Step customizer panel (Indochino) */}
        <section className="flex-1 flex flex-col bg-[#0f0f0f]">
          
          <div className="flex-1 overflow-y-auto px-6 lg:px-16 py-10">
            <div className="max-w-2xl mx-auto">
              <header className="mb-10">
                <span className="text-[#c9a96e] text-[9px] tracking-[0.4em] uppercase font-semibold">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
                <h2 className="text-3xl font-serif font-bold text-[#f5f0eb] mt-1">
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
              className="w-full py-4 px-6 lg:px-16 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-[#c9a96e] text-xs">⚙️</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-zinc-400">Advanced Specifications Details</span>
              </div>
              {showTechnicalDetails ? <ChevronUp size={14} className="text-[#c9a96e]" /> : <ChevronDown size={14} className="text-zinc-500" />}
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
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Canvas Construction</div>
                      <div className="font-semibold text-[#f5f0eb]">Half-Canvas Standard</div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Shoulder Padding</div>
                      <div className="font-semibold text-[#f5f0eb]">Soft Neapolitan Profile</div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Undercollar Melton</div>
                      <div className="font-semibold text-[#f5f0eb]">Color-Matched Felt</div>
                    </div>
                    <div className="p-3 border border-white/5 rounded">
                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Sleeve Buttonholes</div>
                      <div className="font-semibold text-[#f5f0eb]">Working Surgeon's Cuffs</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper Footer Controllers */}
          <footer className="shrink-0 h-24 border-t border-white/5 flex items-center justify-between px-6 lg:px-16 bg-[#0a0a0a]">
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-white disabled:opacity-0 transition-all font-semibold"
            >
              <ArrowLeftIcon size={14} /> Back
            </button>

            <div className="text-right mr-4 hidden md:block">
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 block">Active Price Est.</span>
              <span className="font-mono text-lg font-bold text-[#c9a96e]">£ {totalPrice.toFixed(2)}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (currentStep === STEPS.length - 1) {
                  handleAddToCart();
                } else {
                  setCurrentStep((s) => s + 1);
                }
              }}
              className="bg-[#c9a96e] hover:bg-[#dfc08a] text-black px-10 h-12 rounded font-bold text-[10px] tracking-[0.25em] uppercase flex items-center gap-2 transition-all"
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