import { createReducer, on } from "@ngrx/store";
import { ProfileActions } from "./profile.actions";
import { initialProfileState } from "./profile.state";

export const profileReducer = createReducer(
  initialProfileState,

  on(ProfileActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(ProfileActions.loadSuccess, (state, { workshop }) => ({
    ...state,
    workshop,
    loading: false,
  })),
  on(ProfileActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProfileActions.save, (state) => ({ ...state, saving: true, error: null })),
  on(ProfileActions.saveSuccess, (state, { workshop }) => ({
    ...state,
    workshop,
    saving: false,
  })),
  on(ProfileActions.saveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),
);
