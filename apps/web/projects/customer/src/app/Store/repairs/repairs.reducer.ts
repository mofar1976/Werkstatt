import { createReducer, on } from "@ngrx/store";
import { RepairsActions } from "./repairs.actions";
import { initialRepairsState } from "./repairs.state";

export const repairsReducer = createReducer(
  initialRepairsState,

  // --- list ---
  on(RepairsActions.statusChanged, (state, { status }) => ({
    ...state,
    query: { ...state.query, status, page: 1 },
  })),
  on(RepairsActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(RepairsActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(RepairsActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    items,
    total,
    loading: false,
  })),
  on(RepairsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- detail ---
  on(RepairsActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
  })),
  on(RepairsActions.loadDetailSuccess, (state, { order }) => ({
    ...state,
    selected: order,
    detailLoading: false,
  })),
  on(RepairsActions.loadDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(RepairsActions.leaveDetail, (state) => ({
    ...state,
    selected: null,
    detailError: null,
    saving: false,
  })),

  // --- quote decision ---
  on(RepairsActions.approveQuote, RepairsActions.rejectQuote, (state) => ({
    ...state,
    saving: true,
    detailError: null,
  })),
  on(RepairsActions.decisionSuccess, (state, { order }) => ({
    ...state,
    selected: order,
    saving: false,
    items: state.items.map((o) => (o.id === order.id ? order : o)),
  })),
  on(RepairsActions.decisionFailure, (state, { error }) => ({
    ...state,
    saving: false,
    detailError: error,
  })),
);
