import { createReducer, on } from "@ngrx/store";
import { WorkshopsActions } from "./workshops.actions";
import { initialWorkshopsState } from "./workshops.state";

export const workshopsReducer = createReducer(
  initialWorkshopsState,

  on(WorkshopsActions.searchChanged, (state, { search }) => ({
    ...state,
    query: { ...state.query, search },
  })),
  on(WorkshopsActions.nearChanged, (state, { lat, lng, radiusKm }) => ({
    ...state,
    query: {
      ...state.query,
      near: { lat, lng },
      radiusKm: radiusKm ?? state.query.radiusKm,
    },
  })),
  on(WorkshopsActions.nearCleared, (state) => ({
    ...state,
    query: { ...state.query, near: null },
  })),
  on(WorkshopsActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(WorkshopsActions.loadSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false,
  })),
  on(WorkshopsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(WorkshopsActions.focus, (state, { id }) => ({ ...state, focusedId: id })),

  on(WorkshopsActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
  })),
  on(WorkshopsActions.loadDetailSuccess, (state, { workshop }) => ({
    ...state,
    selected: workshop,
    detailLoading: false,
  })),
  on(WorkshopsActions.loadDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(WorkshopsActions.leaveDetail, (state) => ({
    ...state,
    selected: null,
    detailError: null,
  })),
);
