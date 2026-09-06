import { createReducer, on } from "@ngrx/store";
import { RepairsActions } from "./repairs.actions";
import { initialRepairsState } from "./repairs.state";

export const repairsReducer = createReducer(
  initialRepairsState,

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
);
