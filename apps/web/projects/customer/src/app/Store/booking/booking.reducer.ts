import { createReducer, on } from "@ngrx/store";
import { BookingActions } from "./booking.actions";
import { initialBookingState } from "./booking.state";

export const bookingReducer = createReducer(
  initialBookingState,

  on(BookingActions.opened, (state, { workshopId }) => ({
    ...initialBookingState,
    workshopId,
    loading: true,
  })),
  on(BookingActions.loadSuccess, (state, { workshop, slots, brands }) => ({
    ...state,
    workshop,
    slots,
    brands,
    loading: false,
  })),
  on(BookingActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(BookingActions.brandSelected, (state, { brandId }) => ({
    ...state,
    selectedBrandId: brandId,
    models: [],
    modelsLoading: brandId !== "",
  })),
  on(BookingActions.modelsLoaded, (state, { brandId, models }) =>
    // Ignore a stale response for a brand the user already changed away from.
    state.selectedBrandId === brandId
      ? { ...state, models, modelsLoading: false }
      : state,
  ),
  on(BookingActions.modelsFailed, (state, { error }) => ({
    ...state,
    modelsLoading: false,
    error,
  })),

  on(BookingActions.submit, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(BookingActions.submitSuccess, (state, { appointment }) => ({
    ...state,
    submitting: false,
    bookedAppointmentId: appointment.id,
  })),
  on(BookingActions.submitFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),
  on(BookingActions.slotsReloaded, (state, { slots }) => ({ ...state, slots })),

  on(BookingActions.left, () => initialBookingState),
);
