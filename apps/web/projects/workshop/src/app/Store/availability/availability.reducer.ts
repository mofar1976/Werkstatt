import { createReducer, on } from "@ngrx/store";
import { AvailabilityActions } from "./availability.actions";
import { initialAvailabilityState } from "./availability.state";

export const availabilityReducer = createReducer(
  initialAvailabilityState,

  on(AvailabilityActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AvailabilityActions.loadSuccess, (state, { slots }) => ({
    ...state,
    slots,
    loading: false,
  })),
  on(AvailabilityActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AvailabilityActions.leave, () => ({ ...initialAvailabilityState })),

  on(
    AvailabilityActions.createSlot,
    AvailabilityActions.setSlotStatus,
    AvailabilityActions.deleteSlot,
    (state) => ({ ...state, saving: true, error: null }),
  ),
  on(AvailabilityActions.slotsChanged, (state, { slots }) => ({
    ...state,
    slots,
    saving: false,
  })),
  on(AvailabilityActions.slotSaveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),
);
