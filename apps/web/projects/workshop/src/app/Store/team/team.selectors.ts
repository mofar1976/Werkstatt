import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TEAM_FEATURE_KEY, type TeamState } from "./team.state";

const selectState = createFeatureSelector<TeamState>(TEAM_FEATURE_KEY);

export const selectTeamMembers = createSelector(selectState, (s) => s.members);
export const selectTeamLoading = createSelector(selectState, (s) => s.loading);
export const selectTeamError = createSelector(selectState, (s) => s.error);
export const selectTeamSaving = createSelector(selectState, (s) => s.saving);
