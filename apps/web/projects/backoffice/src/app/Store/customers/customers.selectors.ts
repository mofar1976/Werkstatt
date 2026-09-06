import { createFeatureSelector, createSelector } from "@ngrx/store";
import { CUSTOMERS_FEATURE_KEY, type CustomersState } from "./customers.state";

const selectState = createFeatureSelector<CustomersState>(CUSTOMERS_FEATURE_KEY);

export const selectCustomers = createSelector(selectState, (s) => s.items);
export const selectCustomerTotal = createSelector(selectState, (s) => s.total);
export const selectCustomerQuery = createSelector(selectState, (s) => s.query);
export const selectCustomersLoading = createSelector(
  selectState,
  (s) => s.loading,
);
export const selectCustomersError = createSelector(selectState, (s) => s.error);

export const selectSelectedCustomer = createSelector(
  selectState,
  (s) => s.selected,
);
export const selectCustomerDetailLoading = createSelector(
  selectState,
  (s) => s.detailLoading,
);
export const selectCustomerSaving = createSelector(selectState, (s) => s.saving);
export const selectCustomerDetailError = createSelector(
  selectState,
  (s) => s.detailError,
);
