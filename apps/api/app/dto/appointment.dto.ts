import { z } from "zod";

export const bookAppointmentSchema = z.object({
  slotId: z.string().min(1),
  problemDescription: z.string().trim().min(5).max(2000),
  vehicle: z.object({
    brandId: z.string().min(1),
    modelId: z.string().min(1),
    licensePlate: z.string().trim().min(2).max(15).optional(),
  }),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
