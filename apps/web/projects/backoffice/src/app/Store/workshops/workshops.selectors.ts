import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  WORKSHOPS_FEATURE_KEY,
  type WorkshopsState,
} from "./workshops.state";

const selectWorkshops =
  createFeatureSelector<WorkshopsState>(WORKSHOPS_FEATURE_KEY);

export const selectWorkshopItems = createSelector(selectWorkshops, (s) => s.items);
export const selectWorkshopTotal = createSelector(selectWorkshops, (s) => s.total);
export const selectWorkshopQuery = createSelector(selectWorkshops, (s) => s.query);
export const selectWorkshopsLoading = createSelector(
  selectWorkshops,
  (s) => s.loading,
);
export const selectWorkshopsError = createSelector(
  selectWorkshops,
  (s) => s.error,
);

export const selectSelectedWorkshop = createSelector(
  selectWorkshops,
  (s) => s.selected,
);
export const selectWorkshopMembers = createSelector(
  selectWorkshops,
  (s) => s.members,
);
export const selectDetailLoading = createSelector(
  selectWorkshops,
  (s) => s.detailLoading,
);
export const selectWorkshopSaving = createSelector(
  selectWorkshops,
  (s) => s.saving,
);
export const selectDetailError = createSelector(
  selectWorkshops,
  (s) => s.detailError,
);
