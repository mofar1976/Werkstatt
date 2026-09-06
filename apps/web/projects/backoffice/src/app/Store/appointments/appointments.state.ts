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

export interface AppointmentsState {
  items: Appointment[];
  total: number;
  query: AppointmentsQuery;
  loading: boolean;
  error: string | null;
}

export const initialAppointmentsState: AppointmentsState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 20 },
  loading: false,
  error: null,
};
