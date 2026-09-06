import { z } from "zod";
import { WorkshopRole, WorkshopStatus } from "@car-garage/shared";

const addressSchema = z.object({
  street: z.string().min(1).max(120),
  city: z.string().min(1).max(80),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2).toUpperCase().default("DE"),
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createWorkshopSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).max(30).optional(),
  address: addressSchema,
  location: locationSchema.optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

/**
 * Self-service profile edit in the workshop portal (Chef only). Same fields as
 * the admin edit minus the GeoJSON `location` — coordinates stay an
 * onboarding/admin concern.
 */
export const updateOwnWorkshopSchema = createWorkshopSchema
  .omit({ location: true })
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one field to update",
  });

export const listWorkshopsQuerySchema = z.object({
  status: z.nativeEnum(WorkshopStatus).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const addMemberSchema = z.object({
  email: z.string().email().toLowerCase(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().min(3).max(30).optional(),
  password: z.string().min(8).max(128),
  role: z.nativeEnum(WorkshopRole).default(WorkshopRole.MEMBER),
});

export const updateMemberSchema = z
  .object({
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    phone: z.string().min(3).max(30).optional().or(z.literal("")),
    role: z.nativeEnum(WorkshopRole).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one field to update",
  });

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>;
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>;
export type UpdateOwnWorkshopInput = z.infer<typeof updateOwnWorkshopSchema>;
export type ListWorkshopsQuery = z.infer<typeof listWorkshopsQuerySchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
