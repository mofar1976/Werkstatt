import { createFeatureSelector, createSelector } from "@ngrx/store";
import { WORKSHOPS_FEATURE_KEY, type WorkshopsState } from "./workshops.state";

const selectState =
  createFeatureSelector<WorkshopsState>(WORKSHOPS_FEATURE_KEY);

export const selectWorkshops = createSelector(selectState, (s) => s.items);
export const selectWorkshopsQuery = createSelector(selectState, (s) => s.query);
export const selectWorkshopsLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectWorkshopsError = createSelector(selectState, (s) => s.error);
export const selectFocusedWorkshopId = createSelector(
  selectState,
  (s) => s.focusedId,
);

export const selectSelectedWorkshop = createSelector(
  selectState,
  (s) => s.selected,
);
export const selectWorkshopDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectWorkshopDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);
