import { number } from "framer-motion";

export type Unit = "cm" | "in";
export type ProductType = "STANDARD" | "CUSTOM"

export interface Product {
  id: number;
  categoryId: number;
  fabricId: number;
  name: string;
  slug: string;
  basePrice: string;
  productImage: { default: string; [key: string]: string };
  productType: ProductType
  descriptions?: string
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
  price_impact: string;
}
export interface CustomizationItem {
  id: number;
  groupId: number;
  value: string;
  priceDelta?: number;
  image?: string;
  isDefault?: boolean;
  factoryCode?:string
}

export interface CustomizationGroup {
  id: number;
  categoryId: number,
  name?: string;
  isRequired: boolean;
  displayOrder: number;
  items: CustomizationItem[]
  // options?: CustomOption[];
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  basePrice: string;
  imageUrl: string;
  productType: ProductType
  selectedOptions: Record<string, any>
  // selected_options?: CustomOption[];
  measurementProfileId?: string
  measurements?: CustomGarmentMeasurements
  customizations?: Record<number, number>; // for backward compatibil
  configuration: Record<string, any>;
  totalPrice: string;
}

export interface CustomGarmentMeasurements{
  unit: Unit;
  height: number;
  chest: number;
  waist: number;
  hips: number;
  inseam: number;
  shoulder: number;
  profileName?: string
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
  collections: [];
}

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
  monogram: string;
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
  basePrice?: number;
  totalPrice?: number;
  product: any;
}

export interface ConfigureProps {
  slug: string;
  isOpen?: boolean;
  onClose?: () => void;
}
