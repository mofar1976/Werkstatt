import { createReducer, on } from "@ngrx/store";
import { DashboardActions } from "./dashboard.actions";
import { initialDashboardState } from "./dashboard.state";

export const dashboardReducer = createReducer(
  initialDashboardState,

  on(DashboardActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadSuccess, (state, { overview }) => ({
    ...state,
    overview,
    loading: false,
  })),
  on(DashboardActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
);
