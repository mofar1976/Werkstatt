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
  // list
  items: Appointment[];
  total: number;
  query: AppointmentsQuery;
  loading: boolean;
  error: string | null;
  // detail
  selected: Appointment | null;
  detailLoading: boolean;
  detailError: string | null;
  saving: boolean;
}

export const initialAppointmentsState: AppointmentsState = {
  items: [],
  total: 0,
  query: { status: "", page: 1, pageSize: 10 },
  loading: false,
  error: null,
  selected: null,
  detailLoading: false,
  detailError: null,
  saving: false,
};
