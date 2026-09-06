import { createFeatureSelector, createSelector } from "@ngrx/store";
import { REPAIRS_FEATURE_KEY, type RepairsState } from "./repairs.state";

const selectState = createFeatureSelector<RepairsState>(REPAIRS_FEATURE_KEY);

export const selectRepairs = createSelector(selectState, (s) => s.items);
export const selectRepairsTotal = createSelector(selectState, (s) => s.total);
export const selectRepairsQuery = createSelector(selectState, (s) => s.query);
export const selectRepairsLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectRepairsError = createSelector(selectState, (s) => s.error);

export const selectSelectedRepair = createSelector(
  selectState,
  (s) => s.selected,
);
export const selectRepairDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectRepairDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);
export const selectRepairSaving = createSelector(selectState, (s) => s.saving);
