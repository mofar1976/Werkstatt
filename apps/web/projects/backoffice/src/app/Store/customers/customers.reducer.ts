import { createReducer, on } from "@ngrx/store";
import { CustomersActions } from "./customers.actions";
import { initialCustomersState } from "./customers.state";

export const customersReducer = createReducer(
  initialCustomersState,

  // --- list ---
  on(CustomersActions.searchChanged, (state, { search }) => ({
    ...state,
    query: { ...state.query, search, page: 1 },
  })),
  on(CustomersActions.statusChanged, (state, { status }) => ({
    ...state,
    query: { ...state.query, status, page: 1 },
  })),
  on(CustomersActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(CustomersActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(CustomersActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    items,
    total,
    loading: false,
  })),
  on(CustomersActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- detail ---
  on(CustomersActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
  })),
  on(CustomersActions.loadDetailSuccess, (state, { customer }) => ({
    ...state,
    selected: customer,
    detailLoading: false,
  })),
  on(CustomersActions.loadDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(CustomersActions.leaveDetail, (state) => ({
    ...state,
    selected: null,
    detailError: null,
    saving: false,
  })),

  // --- mutations ---
  on(
    CustomersActions.update,
    CustomersActions.setBlocked,
    CustomersActions.delete,
    (state) => ({ ...state, saving: true, detailError: null }),
  ),
  on(CustomersActions.saveSuccess, (state, { customer }) => ({
    ...state,
    selected: customer,
    saving: false,
    items: state.items.map((c) => (c.id === customer.id ? customer : c)),
  })),
  on(CustomersActions.saveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    detailError: error,
  })),
  on(CustomersActions.deleteSuccess, (state) => ({ ...state, saving: false })),
);
