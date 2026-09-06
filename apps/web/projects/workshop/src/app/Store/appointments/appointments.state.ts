import type { Appointment } from "@car-garage/shared";

export const APPOINTMENTS_FEATURE_KEY = "appointments";

export type AppointmentStatusFilter =
  | ""
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export interface AppointmentsQuery {
  status: AppointmentStatusFilter;
  page: number;
  pageSize: number;
}

/** Current local month as `YYYY-MM`. */
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export interface AppointmentsState {
  // list
  items: Appointment[];
  total: number;
  query: AppointmentsQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: Appointment | null;
  detailLoading: boolean;
  saving: boolean;
  detailError: string | null;
  // calendar (month overview, independent of the paginated list)
  calendarMonth: string;
  calendarItems: Appointment[];
  calendarLoading: boolean;
  calendarError: string | null;
}

export const initialAppointmentsState: AppointmentsState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
  selected: null,
  detailLoading: false,
  saving: false,
  detailError: null,
  calendarMonth: currentMonth(),
  calendarItems: [],
  calendarLoading: false,
  calendarError: null,
};
