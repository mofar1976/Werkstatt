import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  APPOINTMENTS_FEATURE_KEY,
  type AppointmentsState,
} from "./appointments.state";

const selectState =
  createFeatureSelector<AppointmentsState>(APPOINTMENTS_FEATURE_KEY);

export const selectAppointments = createSelector(selectState, (s) => s.items);
export const selectAppointmentTotal = createSelector(
  selectState,
  (s) => s.total,
);
export const selectAppointmentQuery = createSelector(
  selectState,
  (s) => s.query,
);
export const selectAppointmentsLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectAppointmentsError = createSelector(
  selectState,
  (s) => s.error,
);

export const selectCalendarMonth = createSelector(
  selectState,
  (s) => s.calendarMonth,
);
export const selectCalendarItems = createSelector(
  selectState,
  (s) => s.calendarItems,
);
export const selectCalendarLoading = createSelector(
  selectState,
  (s) => s.calendarLoading,
);
export const selectCalendarError = createSelector(
  selectState,
  (s) => s.calendarError,
);

export const selectSelectedAppointment = createSelector(
  selectState,
  (s) => s.selected,
);
export const selectAppointmentDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectAppointmentSaving = createSelector(
  selectState,
  (s) => s.saving,
);
export const selectAppointmentDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);
