"use client";

import { formatCurrency } from "@repo/pricing";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api/api-client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import {
  ShoppingBag,
  Check,
  Home,
  ChevronRight,
  Sparkles,
  Heart,
  Scissors,
  ArrowRight,
  Ruler,
  Star,
  Minus,
  Plus,
  Layers,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { normalizeProduct } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}
const STANDARD_SIZES = [
  { value: "36R", label: "36 Regular" },
  { value: "38R", label: "38 Regular" },
  { value: "40R", label: "40 Regular" },
  { value: "42R", label: "42 Regular" },
  { value: "44R", label: "44 Regular" },
];
export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"fabric" | "delivery" | "returns">(
    "fabric",
  );
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const { addToCart, cart } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      setLoading(true);
      try {
        console.log("Fetching product with slug:", slug);
        const productResponse = await api.getProductBySlug(slug.toLowerCase());
        console.log("Product API response:", productResponse);

        if (productResponse.success && productResponse.product) {
          const normalized = normalizeProduct(productResponse.product);
          setProduct(normalized);
          console.log("Product data set:", normalized);
        } else {
          console.log("Product not found or API error:", productResponse);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const productImages = product
    ? [
        typeof product.productImage === "string"
          ? product.productImage
          : product.productImage?.default ||
            "https://images.unsplash.com/photo-1594938298603-c8148c4b4f5a?w=600&q=80&fit=crop",
      ]
    : [];
  const handleAddToCart = () => {
    if (!product) return;
    // validation guard: standard items mush have an assigned chest size selected
    if (
      product.productType !== "CUSTOM" &&
      !STANDARD_SIZES.some((size) => size.value === product.selectedSize)
    ) {
      alert("Please select a size before adding to cart.");
      return;
    }

    const imageUrl = productImages[0];

    const cartItem = {
      id: product.id,
      productId: product.id,
      name:
        product.productType === "CUSTOM"
          ? `Besspoke ${product.name}`
          : `${product.name} - ${product.selectedSize}`,
      basePrice: product.basePrice,
      totalPrice: product.basePrice,
      quantity: quantity,
      productType: product.productType || "STANDARD",
      imageUrl: imageUrl,
      selectedOptions: [],
      configuration: {
        selections: [],
        measurements: {
          unit: "cm" as const,
          height: 0,
          chest: 0,
          waist: 0,
          hips: 0,
          inseam: 0,
          shoulder: 0,
        },
      },
    };

    addToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const isInCart = cart.some(
    (item) =>
      item.id === product?.id &&
      item.productType === (product?.productType || "STANDARD") &&
      (product?.productType === "CUSTOM" ||
        item.name.includes(`Size ${product.selectedSize}`)),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#f5f0eb] text-xs font-mono tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center flex-col text-center p-8">
        <h1 className="font-serif text-3xl text-[#f5f0eb] mb-4">
          Product Not Found
        </h1>
        <p className="text-[#9a9490] max-w-sm mb-8">
          The premium suit you requested might have been curated out of seasonal
          availability.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-8 py-3.5 bg-[#c9a96e] text-black font-semibold text-xs tracking-widest uppercase  hover:bg-[#dfc08a] transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f5f0eb] pt-24">
      <nav className="border-b border-[#1f1f1f] bg-[#0c0c0c] mt-10">
        <div className="max-w-7xl mx-auto py-5 px-6 lg:px-10 flex items-center text-xs tracking-wider uppercase text-[#9a9490]">
          <span
            className="flex items-center hover:text-[#c9a96e] cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            Home
          </span>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-zinc-800" />
          <span
            className="hover:text-[#c9a96e] cursor-pointer"
            onClick={() => router.push("/collections")}
          >
            Suits
          </span>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-zinc-800" />
          <span className="text-[#c9a96e] font-semibold">{product.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-3/4 overflow-hidden rounded-md bg-[#161616] border border-[#232323] group">
              <img
                src={
                  productImages[activeImageIdx] ||
                  (typeof product?.productImage === "string"
                    ? product.productImage
                    : product?.productImage?.default ||
                      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80&auto=format&fit=crop")
                }
                alt={product?.name}
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              />
              {/* Product Badge */}
              {product.productType === "CUSTOM" ? (
                <span className="absolute top-4 left-4 bg-[#c9a96e] text-black text-[9px] px-3 py-1.5 font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Sparkles size={10} /> Bespoke Tailored
                </span>
              ) : (
                <span className="absolute top-4 left-4 bg-zinc-850 text-[#f5f0eb] text-[9px] px-3 py-1.5 font-bold uppercase tracking-widest shadow-lg border border-white/5">
                  Ready-to-Wear
                </span>
              )}
              {/* Heart/Like Toggle */}
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full border border-white/5 flex items-center justify-center text-[#9a9490] hover:text-[#c9a96e] transition-colors"
              >
                <Heart
                  size={16}
                  className={isLiked ? "fill-[#c9a96e] text-[#c9a96e]" : ""}
                />
              </button>
            </div>
            {/* Thumbnails list */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-3/4 rounded-sm overflow-hidden bg-[#161616] border transition-all ${
                      idx === activeImageIdx
                        ? "border-[#c9a96e] opacity-100"
                        : "border-white/5 opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details / Purchase */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[#c9a96e] text-[10px] tracking-[0.3em] uppercase block mb-2 font-medium">
                Luxury Suiting Collection
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#f5f0eb] mb-3 leading-tight tracking-wide">
                {product.name}
              </h1>
            </div>
            {/* Stars & Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex text-[#c9a96e]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} className="fill-[#c9a96e]" />
                ))}
              </div>
              <span className="text-[11px] text-[#9a9490] font-mono">
                (4.9 out of 5 — 112 reviews)
              </span>
            </div>

            <div className="h-0.5 w-12 bg-[#c9a96e]" />
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-mono text-[#c9a96e] font-semibold">
                {formatCurrency(product?.basePrice || 0)}
              </p>
              <span className="text-xs text-zinc-500 uppercase tracking-wider italic">
                VAT & Import Duties Included
              </span>
            </div>

            <p className="text-[#9a9490] text-sm font-light leading-relaxed">
              {product.description ||
                "Indulge in uncompromised class. Every silhouette is designed specifically for discerning modern criteria, ensuring clean structural drapes and mobility."}
            </p>

            {product.productType === "CUSTOM" ? (
              // Bespoke tailored callouts
              <div className="p-5 border border-[#c9a96e]/20 bg-[#c9a96e]/5 space-y-4">
                <div className="flex gap-3">
                  <Scissors
                    className="text-[#c9a96e] shrink-0 mt-0.5"
                    size={16}
                  />
                  <div>
                    <h4 className="font-serif text-[#f5f0eb] text-sm font-bold">
                      Uncompromised Customisation
                    </h4>
                    <p className="text-xs text-[#9a9490] mt-1 leading-relaxed">
                      This suit is designated for custom drafting. Add it to
                      your bag as-is, or proceed to our studio to define
                      fabrics, linings, buttons, lapels, and input anatomical
                      measurement specs.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart || isAdded}
                    className={`flex-1 h-12 text-xs font-bold tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-2 rounded shadow-md cursor-pointer ${
                      isInCart || isAdded
                        ? "bg-green-600 text-white"
                        : "bg-[#141414] text-[#f5f0eb] border border-[#c9a96e]/40 hover:border-[#c9a96e] hover:bg-[#c9a96e]/10"
                    }`}
                  >
                    {isInCart || isAdded ? (
                      <>
                        <Check size={14} />
                        {isInCart ? "Currently in Bag" : "Added Successfully!"}
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        Add to Bag
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/products/${product.slug}/configure`)
                    }
                    className="flex-1 bg-[#c9a96e] text-black text-xs font-bold tracking-[0.25em] uppercase h-12 hover:bg-[#dfc08a] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md rounded"
                  >
                    Design Now
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              // Standard sizing workflow
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <label className="text-xs font-semibold uppercase tracking-widest text-[#9a9490]">
                      Select Jacket Size
                    </label>
                    <button className="text-[10px] text-[#c9a96e] hover:underline flex items-center gap-1 uppercase tracking-wider font-semibold">
                      <Ruler size={11} /> View Sizing Chart
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {STANDARD_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      className={`py-3 text-center text-xs font-mono border rounded-sm transition-all ${
                        selectedSize === size.value
                          ? "border-[#c9a96e] bg-[#c9a96e]/10 text-white font-semibold"
                          : "border-[#2e2e2e] bg-[#141414] text-zinc-500 hover:border-[#9a9490]"
                      }`}
                    >
                      {size.value}
                    </button>
                  ))}
                </div>

                {/* Quantity adjustments */}
                <div className="flex gap-4 items-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#9a9490]">
                    Quantity
                  </span>
                  <div className="flex items-center bg-[#141414] border border-[#2e2e2e] rounded p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1 hover:text-[#c9a96e] disabled:opacity-30 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-mono text-xs font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 hover:text-[#c9a96e] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                {/* Ready to Wear CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart || isAdded}
                  className={`w-full h-12 text-xs font-bold tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-2 rounded shadow-md cursor-pointer ${
                    isInCart || isAdded
                      ? "bg-green-600 text-white"
                      : "bg-[#c9a96e] text-black hover:bg-[#dfc08a]"
                  }`}
                >
                  {isInCart || isAdded ? (
                    <>
                      <Check size={14} />
                      {/* {isInCart ? "Currently in Bag" : "Added Successfully!"} */}
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      Add to Bag
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Customization Overview Tab Panel */}
            {product.customizationGroups?.length > 0 && (
              <div className="p-5 border border-white/5 bg-[#121212] rounded">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#f5f0eb] mb-3 flex items-center gap-1.5">
                  <Layers size={12} className="text-[#c9a96e]" /> Available
                  Custom Swatches
                </h3>
                <div className="flex flex-wrap gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  {product.customizationGroups.map((group: any) => (
                    <span
                      key={group.id}
                      className="bg-white/5 px-2.5 py-1 rounded border border-white/5"
                    >
                      {group.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust & Accoutrements Section */}
            <div className="border-t border-white/5 pt-6 space-y-4">
              <div className="flex gap-3 items-start text-xs text-zinc-400">
                <Truck size={16} className="text-[#c9a96e] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#f5f0eb]">
                    Insured Global Delivery:
                  </strong>{" "}
                  Dispatch in 14 standard workdays. Free worldwide tracking
                  applies to all premium items.
                </p>
              </div>
              <div className="flex gap-3 items-start text-xs text-zinc-400">
                <ShieldCheck
                  size={16}
                  className="text-[#c9a96e] shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-[#f5f0eb]">
                    Suit Masters Signature Shield:
                  </strong>{" "}
                  All fabrics are sourced securely from elite global weavers
                  including Loro Piana & Vitale Barberis.
                </p>
              </div>
            </div>

            {/* Trust Accordions */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex border-b border-white/5">
                {["fabric", "delivery", "returns"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 pb-3 text-[10px] uppercase tracking-widest font-bold transition-all border-b ${
                      activeTab === tab
                        ? "border-[#c9a96e] text-white"
                        : "border-transparent text-zinc-650 hover:text-zinc-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="py-4 text-xs text-[#9a9490] leading-relaxed">
                {activeTab === "fabric" && (
                  <p>
                    Crafted from{" "}
                    {product?.fabric?.name || "100% Super Merino Wool"} thread
                    counts. Breathable, dynamic structural weight ideal for
                    boardroom schedules, ceremonies, and seasonal drapes.
                    Undercollar Melton components are color-matched felt.
                  </p>
                )}
                {activeTab === "delivery" && (
                  <p>
                    Each design undergoes rigid physical checks before dispatch.
                    Bespoke tailored orders require up to 14 standard days.
                    Tracking numbers will be dispatched dynamically once package
                    scans commence.
                  </p>
                )}
                {activeTab === "returns" && (
                  <p>
                    As customized orders are tailored specifically to your
                    unique anatomical dimensions, returns are restricted except
                    in rare cases of sizing variance. Ready-to-Wear items can be
                    exchanged within 30 days.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
