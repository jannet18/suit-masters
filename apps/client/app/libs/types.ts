// export type SuitVisualizerProps = {
//   selectedOptions: {
//     style?: string;
//     lapel?: string;
//     fabric?: {
//       pattern?: string;
//       color?: string;
//     };
//     monogram?: string;
//   };
// };
// type SelectedOptions = {
//   style: string;
//   lapel: string;
//   fabric?: {
//     pattern?: string;
//     color?: string;
//   };
//   monogram?: string;
// };

// type SuitVisualizerProps = {
//   selectedOptions: SelectedOptions;
// };

// export type { SelectedOptions, SuitVisualizerProps };
// export type StyleOption = "singlle-breasted" | "double-breasted";
// export type LapelOption = "notch" | "peak";

// export type FabricOption = {
//   id?: string;
//   name?: string;
//   pattern?: string;
//   color?: string;
//   premium?: boolean;
//   priceModifier?: number;
// };

// export type SelectedOptions = {
//   fabric: FabricOption | null;
//   style: string;
//   lapel: string;
//   buttons: string;
//   vents: string;
//   pockets: string;
//   lining: string;
//   monogram: string;
// };

// export type SuitVisualizerProps = {
//   selectedOptions: SelectedOptions;
// };

// export type CustomizationOptsProps = {
//   step: { id: string; [key: string]: any };
//   selectedOptions: Record<string, any>;
//   handleSelect: (category: string, value: string) => void;
// };

export type StepKey =
  | "fabric"
  | "style"
  | "details"
  | "measurements"
  | "review"
  | "monogram";

export interface Step {
  id: StepKey;
  name: string;
  options: Array<{ id: string; name: string; [key: string]: any }>;
}

export interface FabricOpts {
  id: string;
  name: string;
  pattern?: string | null;
  color: string;
  premium: boolean;
  priceModifier?: number;
}

export interface SelectedOptions {
  fabric?: FabricOpts | null;
  style: string;
  lapel: string;
  buttons?: string;
  vents: string;
  pockets: string;
  lining: string;
  monogram: string;
}

export type OptionChangeHandler = (
  category: keyof SelectedOptions,
  value: any,
) => void;

export interface Product {
  id: number;
  name: string;
  image: { default: string } & Record<string, string>;
  price: number;
  sizes: string[];
  colors: string[];
  originalPrice: number;
  discount: number;
  sku: string;
  rating: number;
  delivery: string;
  category: string;
}
