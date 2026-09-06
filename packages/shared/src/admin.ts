import type { Appointment } from "./appointment";

/** Platform-admin dashboard: a workshop still waiting to be activated. */
export interface PendingWorkshopSummary {
  id: string;
  name: string;
  city: string;
  createdAt: string;
}

/** Aggregate figures for the Backoffice dashboard. */
export interface AdminOverview {
  workshops: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  customers: {
    total: number;
    blocked: number;
  };
  appointments: {
    /** CONFIRMED and still in the future. */
    upcoming: number;
    total: number;
  };
  repairOrders: {
    /** Not in a terminal status (open work). */
    open: number;
    /** Waiting for a customer decision on the estimate. */
    awaitingApproval: number;
    total: number;
  };
  catalog: {
    brands: number;
    models: number;
  };
  /** Newest workshops still in PENDING, for a quick activation shortcut. */
  pendingWorkshops: PendingWorkshopSummary[];
  /** Most recently booked appointments across all workshops. */
  recentAppointments: Appointment[];
}
