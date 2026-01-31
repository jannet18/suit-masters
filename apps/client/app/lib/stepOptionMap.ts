// export type StepKey = "fabric" | "style" | "lapel" | "monogram";

// export interface Option {
//   id: string;
//   name: string;
//   color?: string;
//   pattern?: string;
//   premium?: boolean;
//   priceModifier?: number;
//   [key: string]: any;
// }
// export const stepOptionMap: Record<StepKey, Option[]> = {
//   style: {
//     label: "Select Suit Style",
//     options: [
//       { id: "single-breasted", name: "Single-Breasted" },
//       { id: "double-breasted", name: "Double-Breasted" },
//     ],
//   },
//   lapel: [
//     label: "Select Lapel Type",
//     options: [
//       { id: "notch", name: "Notch Lapel" },
//       { id: "peak", name: "Peak Lapel" },
//     ],
//   ],
//   fabric: {
//     label: "Select Fabric",
//     options: [
//       {
//         id: "navy-wool",
//         name: "Navy Wool",
//         color: "#1E3A8A",
//         pattern: "https://www.transparenttextures.com/patterns/wool.png",
//       },
//       {
//         id: "gray-tweed",
//         name: "Grey Tweed",
//         color: "#374151",
//         pattern: "https://www.transparenttextures.com/patterns/tweed.png",
//       },
//     ],
//   },
//   monogram: { label: "Add Monogram", options: [] },
// };

// export const stepOptionMap: Record<StepKey, Option[]> = {
//   fabric: [
//     { id: "wool-navy", name: "Navy Wool", color: "#1a2a4a" },
//     { id: "linen-beige", name: "Beige Linen", color: "#d7c39a" },
//   ],
//   lapel: [
//     { id: "notch", name: "Notch Lapel" },
//     { id: "peak", name: "Peak Lapel", premium: true },
//   ],
//   buttons: [
//     { id: "two-button", name: "Two Buttons" },
//     { id: "three-button", name: "Three Buttons" },
//   ],
// };
// // export type StepKey = keyof typeof stepOptionMap;

export type StepKey = "fabric" | "style" | "lapel" | "monogram";

export interface Option {
  id: string;
  name: string;
  color?: string;
  pattern?: string;
  premium?: boolean;
  priceModifier?: number;
  [key: string]: any;
}

export interface StepOptionGroup {
  label: string;
  options: Option[];
}

export const stepOptionMap: Record<StepKey, StepOptionGroup> = {
  style: {
    label: "Select Suit Style",
    options: [
      { id: "single-breasted", name: "Single-Breasted" },
      { id: "double-breasted", name: "Double-Breasted" },
    ],
  },
  lapel: {
    label: "Select Lapel Type",
    options: [
      { id: "notch", name: "Notch Lapel" },
      { id: "peak", name: "Peak Lapel" },
    ],
  },
  fabric: {
    label: "Select Fabric",
    options: [
      {
        id: "navy-wool",
        name: "Navy Wool",
        color: "#1E3A8A",
        pattern:
          "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "gray-tweed",
        name: "Grey Tweed",
        color: "#374151",
        pattern:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  },
  monogram: {
    label: "Add Monogram",
    options: [],
  },
};
