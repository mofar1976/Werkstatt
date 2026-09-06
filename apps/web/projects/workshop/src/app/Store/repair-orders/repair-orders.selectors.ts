import { createFeatureSelector, createSelector } from "@ngrx/store";
import {
  REPAIR_ORDERS_FEATURE_KEY,
  type RepairOrdersState,
} from "./repair-orders.state";

const selectState = createFeatureSelector<RepairOrdersState>(
  REPAIR_ORDERS_FEATURE_KEY,
);

export const selectRepairOrders = createSelector(selectState, (s) => s.items);
export const selectRepairOrderTotal = createSelector(
  selectState,
  (s) => s.total,
);
export const selectRepairOrderQuery = createSelector(
  selectState,
  (s) => s.query,
);
export const selectRepairOrdersLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectRepairOrdersError = createSelector(
  selectState,
  (s) => s.error,
);

export const selectSelectedRepairOrder = createSelector(
  selectState,
  (s) => s.selected,
);
export const selectRepairOrderDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectRepairOrderSaving = createSelector(
  selectState,
  (s) => s.saving,
);
export const selectRepairOrderDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);
export const selectRepairTeamMembers = createSelector(
  selectState,
  (s) => s.teamMembers,
);
export const selectRepairCandidates = createSelector(
  selectState,
  (s) => s.candidates,
);
export const selectRepairCandidatesLoading = createSelector(
  selectState,
  (s) => s.candidatesLoading,
);
