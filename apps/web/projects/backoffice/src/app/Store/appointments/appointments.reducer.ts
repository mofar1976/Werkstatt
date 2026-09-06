import { createReducer, on } from "@ngrx/store";
import { AppointmentsActions } from "./appointments.actions";
import { initialAppointmentsState } from "./appointments.state";

export const appointmentsReducer = createReducer(
  initialAppointmentsState,

  on(AppointmentsActions.statusChanged, (state, { status }) => ({
    ...state,
    query: { ...state.query, status, page: 1 },
  })),
  on(AppointmentsActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(AppointmentsActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AppointmentsActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    items,
    total,
    loading: false,
  })),
  on(AppointmentsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
