import { z } from "zod";

const isoDatetime = z.string().datetime({ offset: true });

export const createSlotSchema = z
  .object({
    startsAt: isoDatetime,
    durationMinutes: z.coerce.number().int().min(15).max(600).default(60),
  })
  .transform((v) => ({
    startsAt: new Date(v.startsAt),
    endsAt: new Date(new Date(v.startsAt).getTime() + v.durationMinutes * 60_000),
  }));

export const listSlotsQuerySchema = z.object({
  from: isoDatetime.optional(),
  to: isoDatetime.optional(),
  status: z.enum(["OPEN", "BOOKED", "BLOCKED"]).optional(),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type ListSlotsQuery = z.infer<typeof listSlotsQuerySchema>;
