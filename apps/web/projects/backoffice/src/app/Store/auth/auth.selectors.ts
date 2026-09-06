import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, type AuthState } from "./auth.state";

const selectAuth = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);

export const selectAuthUser = createSelector(selectAuth, (s) => s.user);
export const selectAuthTokens = createSelector(selectAuth, (s) => s.tokens);
export const selectAuthLoading = createSelector(selectAuth, (s) => s.loading);
export const selectAuthError = createSelector(selectAuth, (s) => s.error);
export const selectIsAuthenticated = createSelector(
  selectAuth,
  (s) => !!s.tokens?.accessToken,
);
