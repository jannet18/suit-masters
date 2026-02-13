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
  name: string;
  quantity: number;
  base_price: string;
  image_url: string;
  product_type: "STANDARD" | "CUSTOM";
  selected_options?: Record<number, number>;
  measurements?: Record<string, any>;
  customizations?: Record<number, number>; // for backward compatibility
}

export interface Group {
  id: number;
  name: string;
  type: "fabric" | "style" | "details";
  items: CustomizationItem[];
}
