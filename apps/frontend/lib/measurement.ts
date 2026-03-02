import { z } from "zod";

export const measurementSchema = z.object({
  unit: z.enum(["cm", "in"]),
  height: z.number().min(120).max(220),
  chest: z.number().min(70).max(150),
  waist: z.number().min(60).max(150),
  hips: z.number().min(70).max(160),
  inseam: z.number().min(60).max(110),
  shoulder: z.number().min(35).max(65),
});
