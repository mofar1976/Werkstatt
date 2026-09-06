import { createReducer, on } from "@ngrx/store";
import { AuthActions } from "./auth.actions";
import { initialAuthState } from "./auth.state";

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { result }) => ({
    ...state,
    user: result.user,
    tokens: result.tokens,
    loading: false,
    error: null,
  })),

  on(AuthActions.sessionRestored, (state, { user, tokens }) => ({
    ...state,
    user,
    tokens,
    loading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    user: null,
    tokens: null,
    loading: false,
    error,
  })),

  on(
    AuthActions.logout,
    AuthActions.sessionExpired,
    AuthActions.noSession,
    () => ({ ...initialAuthState }),
  ),
);
