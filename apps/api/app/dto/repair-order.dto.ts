import { z } from "zod";
import { LineItemKind, PartAction, RepairOrderStatus } from "@car-garage/shared";

export const createRepairOrderSchema = z.object({
  appointmentId: z.string().min(1),
});

const lineItemSchema = z
  .object({
    kind: z.nativeEnum(LineItemKind),
    partAction: z.nativeEnum(PartAction).optional(),
    description: z.string().trim().min(1).max(200),
    quantity: z.number().positive().max(10_000),
    /** Net price per unit, in cents. */
    unitPriceCents: z.number().int().min(0).max(100_000_00),
  })
  .refine(
    (v) => (v.kind === LineItemKind.PART ? v.partAction !== undefined : v.partAction === undefined),
    { message: "partAction is required for PART items and forbidden for LABOR" },
  );

export const saveDiagnosisSchema = z
  .object({
    cause: z.string().trim().max(4000).optional(),
    quote: z
      .object({
        lineItems: z.array(lineItemSchema).max(100).default([]),
        notes: z.string().trim().max(2000).optional(),
        taxRatePercent: z.number().min(0).max(25).default(19),
      })
      .optional(),
  })
  .refine((v) => v.cause !== undefined || v.quote !== undefined, {
    message: "Provide a cause and/or a quote",
  });

export const setAssigneesSchema = z.object({
  memberIds: z.array(z.string().min(1)).max(20),
});

export const advanceStatusSchema = z.object({
  /** Workshop-driven transitions; customer approval has its own routes. */
  status: z.enum([
    "DIAGNOSIS_IN_PROGRESS",
    "REPAIR_IN_PROGRESS",
    "WAITING_FOR_PARTS",
    "REPAIR_COMPLETED",
    "READY_FOR_PICKUP",
    "CLOSED",
  ]),
  note: z.string().trim().max(2000).optional(),
});

export const addNoteSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const cancelRepairOrderSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const rejectQuoteSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const listRepairOrdersQuerySchema = z.object({
  status: z.nativeEnum(RepairOrderStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateRepairOrderInput = z.infer<typeof createRepairOrderSchema>;
export type SaveDiagnosisInput = z.infer<typeof saveDiagnosisSchema>;
export type SetAssigneesInput = z.infer<typeof setAssigneesSchema>;
export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type CancelRepairOrderInput = z.infer<typeof cancelRepairOrderSchema>;
export type RejectQuoteInput = z.infer<typeof rejectQuoteSchema>;
export type ListRepairOrdersQuery = z.infer<typeof listRepairOrdersQuerySchema>;
