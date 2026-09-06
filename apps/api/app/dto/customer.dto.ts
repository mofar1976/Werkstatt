import { z } from "zod";

export const listCustomersQuerySchema = z.object({
  /** "active" | "blocked" — filter by account state. */
  status: z.enum(["active", "blocked"]).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateCustomerSchema = z
  .object({
    firstName: z.string().min(1).max(80).optional(),
    lastName: z.string().min(1).max(80).optional(),
    phone: z.string().min(3).max(30).optional().or(z.literal("")),
  })
  .strict();

export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
