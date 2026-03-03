import { CustomOption } from "@/app/stores/useCartStore";

export interface Product {
  id: number;
  name: string;
  base_price: number;
  product_image: { default: string; [key: string]: string };
  product_type: "STANDARD" | "CUSTOM";
  options?: CustomizationGroup[];
  discount?: number;
  rating?: number;
  sku?: string;
  sizes?: string[];
  colors?: string[];
}

export interface CustomizationItem {
  id: number;
  group_id: number;
  value: string;
  price_delta?: number;
  image?: string;
  is_default?: boolean;
}

export interface CustomizationGroup {
  id: number;
  name?: string;
  items?: CustomizationItem[];
}

export interface CartItem {
  id: number;
  productId: string;
  name: string;
  quantity: number;
  base_price: number;
  image_url: string;
  product_type: "STANDARD" | "CUSTOM";
  selected_options?: CustomOption[];
  measurements?: Record<string, any>;
  customizations?: Record<number, number>; // for backward compatibil
  configuration: Record<string, any>;
  totalPrice: number;
}
// because if user reopens configurator later, it should not mutate cart item.
// Cart must be immutable.

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
}

export type Unit = "cm" | "in";

export interface Measurements {}

export interface FittingData {
  style: string;
  fit: string;
  buttons: string;
  fabric: string;
  fabricColor: string;
  lapel: string;
  lining: string;
  buttonColor: string;
  measurements: {
    unit: Unit;
    height: number;
    chest: number;
    waist: number;
    hips: number;
    inseam: number;
    shoulder: number;
  };
}

export interface StepProps {
  data: FittingData;
  onChange: (updates: Partial<FittingData>) => void;
  basePrice: number;
  totalPrice: number;
}
