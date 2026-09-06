import { createFeatureSelector, createSelector } from "@ngrx/store";
import { BOOKING_FEATURE_KEY, type BookingState } from "./booking.state";

const selectState = createFeatureSelector<BookingState>(BOOKING_FEATURE_KEY);

export const selectBookingWorkshop = createSelector(
  selectState,
  (s) => s.workshop,
);
export const selectBookingSlots = createSelector(selectState, (s) => s.slots);
export const selectBookingBrands = createSelector(selectState, (s) => s.brands);
export const selectBookingModels = createSelector(selectState, (s) => s.models);
export const selectBookingModelsLoading = createSelector(
  selectState,
  (s) => s.modelsLoading,
);
export const selectBookingLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectBookingError = createSelector(selectState, (s) => s.error);
export const selectBookingSubmitting = createSelector(
  selectState,
  (s) => s.submitting,
);
export const selectBookingSubmitError = createSelector(
  selectState,
  (s) => s.submitError,
);
export const selectBookedAppointmentId = createSelector(
  selectState,
  (s) => s.bookedAppointmentId,
);
export const selectBookingWorkshopId = createSelector(
  selectState,
  (s) => s.workshopId,
);
