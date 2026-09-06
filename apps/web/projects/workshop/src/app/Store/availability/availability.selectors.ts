import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  AVAILABILITY_FEATURE_KEY,
  type AvailabilityState,
} from "./availability.state";

const selectState =
  createFeatureSelector<AvailabilityState>(AVAILABILITY_FEATURE_KEY);

export const selectSlots = createSelector(selectState, (s) => s.slots);
export const selectSlotsLoading = createSelector(selectState, (s) => s.loading);
export const selectSlotsError = createSelector(selectState, (s) => s.error);
export const selectSlotsSaving = createSelector(selectState, (s) => s.saving);
