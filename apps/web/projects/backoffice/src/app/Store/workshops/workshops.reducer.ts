import { createReducer, on } from "@ngrx/store";
import { WorkshopsActions } from "./workshops.actions";
import { initialWorkshopsState } from "./workshops.state";

export const workshopsReducer = createReducer(
  initialWorkshopsState,

  // --- list ---
  on(WorkshopsActions.searchChanged, (state, { search }) => ({
    ...state,
    query: { ...state.query, search, page: 1 },
  })),
  on(WorkshopsActions.statusChanged, (state, { status }) => ({
    ...state,
    query: { ...state.query, status, page: 1 },
  })),
  on(WorkshopsActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(WorkshopsActions.load, (state) => ({ ...state, loading: true, error: null })),
  on(WorkshopsActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    items,
    total,
    loading: false,
  })),
  on(WorkshopsActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- detail ---
  on(WorkshopsActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
    members: [],
  })),
  on(WorkshopsActions.loadDetailSuccess, (state, { workshop, members }) => ({
    ...state,
    selected: workshop,
    members,
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
    members: [],
    detailError: null,
    saving: false,
  })),

  // --- mutations ---
  on(
    WorkshopsActions.create,
    WorkshopsActions.update,
    WorkshopsActions.toggleStatus,
    WorkshopsActions.delete,
    WorkshopsActions.addMember,
    WorkshopsActions.updateMemberRole,
    WorkshopsActions.removeMember,
    (state) => ({ ...state, saving: true, detailError: null }),
  ),
  on(WorkshopsActions.saveSuccess, (state, { workshop }) => ({
    ...state,
    selected: workshop,
    saving: false,
    items: state.items.map((w) => (w.id === workshop.id ? workshop : w)),
  })),
  on(
    WorkshopsActions.saveFailure,
    WorkshopsActions.memberSaveFailure,
    (state, { error }) => ({ ...state, saving: false, detailError: error }),
  ),
  on(WorkshopsActions.deleteSuccess, (state) => ({ ...state, saving: false })),
  on(WorkshopsActions.membersChanged, (state, { members }) => ({
    ...state,
    members,
    saving: false,
  })),
);
