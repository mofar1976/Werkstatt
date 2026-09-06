import { createFeatureSelector, createSelector } from "@ngrx/store";
import { PROFILE_FEATURE_KEY, type ProfileState } from "./profile.state";

const selectState = createFeatureSelector<ProfileState>(PROFILE_FEATURE_KEY);

export const selectWorkshop = createSelector(selectState, (s) => s.workshop);
export const selectProfileLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectProfileError = createSelector(selectState, (s) => s.error);
export const selectProfileSaving = createSelector(selectState, (s) => s.saving);
