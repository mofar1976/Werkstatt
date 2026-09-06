import { z } from "zod";

export const browseWorkshopsQuerySchema = z.object({
  search: z.string().max(120).optional(),
  /** "lat,lng" — restrict results to workshops within `radiusKm`. */
  near: z
    .string()
    .regex(/^-?\d{1,3}(\.\d+)?,-?\d{1,3}(\.\d+)?$/)
    .optional(),
  radiusKm: z.coerce.number().min(1).max(500).default(25),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const browseSlotsQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type BrowseWorkshopsQuery = z.infer<typeof browseWorkshopsQuerySchema>;
export type BrowseSlotsQuery = z.infer<typeof browseSlotsQuerySchema>;
