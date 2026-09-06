import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1).max(80),
});

export const updateBrandSchema = createBrandSchema.partial();

export const createModelSchema = z.object({
  name: z.string().min(1).max(120),
});

export const updateModelSchema = createModelSchema.partial();

export const listQuerySchema = z.object({
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;
export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
