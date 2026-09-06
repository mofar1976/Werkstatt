import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  DASHBOARD_FEATURE_KEY,
  type DashboardState,
} from "./dashboard.state";

const selectState =
  createFeatureSelector<DashboardState>(DASHBOARD_FEATURE_KEY);

export const selectOverview = createSelector(
  selectState,
  (s) => s.overview,
);
export const selectDashboardLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectDashboardError = createSelector(
  selectState,
  (s) => s.error,
);
