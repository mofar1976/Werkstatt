import { createReducer, on } from "@ngrx/store";
import { TeamActions } from "./team.actions";
import { initialTeamState } from "./team.state";

export const teamReducer = createReducer(
  initialTeamState,

  on(TeamActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadSuccess, (state, { members }) => ({
    ...state,
    members,
    loading: false,
  })),
  on(TeamActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(TeamActions.leave, () => ({ ...initialTeamState })),

  on(
    TeamActions.addMember,
    TeamActions.updateMember,
    TeamActions.removeMember,
    (state) => ({ ...state, saving: true, error: null }),
  ),
  on(TeamActions.membersChanged, (state, { members }) => ({
    ...state,
    members,
    saving: false,
  })),
  on(TeamActions.memberSaveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),
);
