// Money: every price in these types is integer minor units (pence), as sent
// by the API. Display with formatCurrency() from @repo/pricing.

export type Unit = "cm" | "in";
export type ProductType = "STANDARD" | "CUSTOM";

export interface Product {
  id: number;
  categoryId: number;
  fabricId: number;
  name: string;
  slug: string;
  basePrice: number;
  productImage: { default: string; [key: string]: string };
  productType: ProductType;
  descriptions?: string;
  isActive: boolean;
  options?: CustomizationGroup[];
  discount?: number;
  rating?: number;
  sku?: string;
  sizes?: string[];
  colors?: string[];
}

export interface CustomOption {
  id: number;
  group_id: number;
  label: string;
  price_impact: number;
}

export interface CustomizationItem {
  id: number;
  groupId: number;
  value: string;
  priceDelta?: number;
  image?: string;
  isDefault?: boolean;
  factoryCode?: string;
}

export interface CustomizationGroup {
  id: number;
  categoryId: number;
  name?: string;
  isRequired: boolean;
  displayOrder: number;
  items: CustomizationItem[];
}

/**
 * FittingData — the canonical shape describing a bespoke garment's
 * style selections and anatomical measurements. All properties are
 * camelCase with robust runtime fallbacks for snake_case API variants.
 */
export interface FittingData {
  style: string;
  fit: string;
  fabric: string;
  fabricColor: string;
  lapel: string;
  pocket: string;
  lining: string;
  buttons: string;
  buttonColor: string;
  monogram: string;
  measurements: {
    unit: "cm" | "in";
    height: number;
    chest: number;
    waist: number;
    hips: number;
    inseam: number;
    shoulder: number;
  };
}

/**
 * CartItem — the standardized cart line item. `selectedOptions` and
 * `configuration` follow the spec exactly so the cart, checkout, and
 * server-sync layers all agree on shape.
 */
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  basePrice: number;
  imageUrl: string;
  productType: "STANDARD" | "CUSTOM";
  quantity: number;
  selectedOptions: Array<{
    id: number;
    group_id: number;
    label: string;
    price_impact: number;
  }>;
  configuration: {
    selections: any[];
    measurements: FittingData["measurements"];
    monogram?: string;
  };
  /** Unit price including options (pence). Display only; checkout reprices on the server. */
  totalPrice: number;
}

export interface CustomGarmentMeasurements {
  unit: Unit;
  height: number;
  chest: number;
  waist: number;
  hips: number;
  inseam: number;
  shoulder: number;
  profileName?: string;
}

export interface Group {
  id: number;
  name: string;
  type: "fabric" | "style" | "details";
  items: CustomizationItem[];
}

export interface Collection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  tag?: string;
  span?: string;
  slug: string;
  collections: [];
}

export interface Measurements {}

export interface StepProps {
  data: FittingData;
  onChange: (updates: Partial<FittingData>) => void;
  basePrice?: number;
  totalPrice?: number;
  product: any;
}

export interface ConfigureProps {
  slug: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/* ==================== NORMALIZATION HELPERS ==================== */
/**
 * Robust runtime normalization for product payloads that may arrive in
 * snake_case (from the database/API) or camelCase. Returns a stable
 * camelCase object the UI can rely on.
 */
export function normalizeProduct(raw: any): any {
  if (!raw) return raw;
  return {
    ...raw,
    id: Number(raw.id ?? raw.product_id ?? 0),
    name: raw.name ?? raw.product_name ?? "Bespoke Garment",
    slug: raw.slug ?? raw.product_slug ?? "",
    basePrice: Number(raw.basePrice ?? raw.base_price ?? 0),
    productImage: raw.productImage ?? raw.product_image ?? { default: "" },
    productType: (raw.productType ??
      raw.product_type ??
      "CUSTOM") as ProductType,
    customizationGroups: normalizeCustomizationGroups(
      raw.customizationGroups ?? raw.customization_groups ?? raw.options ?? [],
    ),
  };
}

function normalizeCustomizationGroups(groups: any[]): any[] {
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => ({
    ...g,
    id: Number(g.id ?? g.group_id ?? 0),
    name: g.name ?? g.group_name ?? "Options",
    options: normalizeOptions(g.options ?? g.items ?? []),
  }));
}

function normalizeOptions(options: any[]): any[] {
  if (!Array.isArray(options)) return [];
  return options.map((o) => ({
    ...o,
    id: Number(o.id ?? o.option_id ?? 0),
    value: o.value ?? o.name ?? o.label ?? "",
    priceDelta: Number(o.priceDelta ?? o.price_delta ?? o.price_impact ?? 0),
    description: o.description ?? o.desc ?? "",
  }));
}

/**
 * Normalize a raw measurement definition payload (snake_case tolerant)
 * into the camelCase shape consumed by the measurement step.
 */
export function normalizeMeasurementDefinition(raw: any): any {
  return {
    id: Number(raw.id ?? 0),
    bodyPart: raw.bodyPart ?? raw.body_part ?? "",
    displayName: raw.displayName ?? raw.display_name ?? "",
    description: raw.description ?? "",
    videoUrl: raw.videoUrl ?? raw.video_url ?? "",
    displayOrder: Number(raw.displayOrder ?? raw.display_order ?? 0),
  };
}
