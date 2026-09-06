import { createReducer, on } from "@ngrx/store";
import { RepairOrdersActions } from "./repair-orders.actions";
import { initialRepairOrdersState } from "./repair-orders.state";

export const repairOrdersReducer = createReducer(
  initialRepairOrdersState,

  // --- list ---
  on(RepairOrdersActions.statusChanged, (state, { status }) => ({
    ...state,
    query: { ...state.query, status, page: 1 },
  })),
  on(RepairOrdersActions.pageChanged, (state, { page }) => ({
    ...state,
    query: { ...state.query, page },
  })),
  on(RepairOrdersActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(RepairOrdersActions.loadSuccess, (state, { items, total }) => ({
    ...state,
    items,
    total,
    loading: false,
  })),
  on(RepairOrdersActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // --- detail ---
  on(RepairOrdersActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
  })),
  on(RepairOrdersActions.loadDetailSuccess, (state, { order }) => ({
    ...state,
    selected: order,
    detailLoading: false,
  })),
  on(RepairOrdersActions.loadDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(RepairOrdersActions.leaveDetail, (state) => ({
    ...state,
    selected: null,
    detailError: null,
    saving: false,
    teamMembers: [],
  })),
  on(RepairOrdersActions.loadTeamSuccess, (state, { members }) => ({
    ...state,
    teamMembers: members,
  })),

  // --- new-order candidates ---
  on(RepairOrdersActions.loadCandidates, (state) => ({
    ...state,
    candidatesLoading: true,
  })),
  on(RepairOrdersActions.loadCandidatesSuccess, (state, { candidates }) => ({
    ...state,
    candidates,
    candidatesLoading: false,
  })),
  on(RepairOrdersActions.loadCandidatesFailure, (state) => ({
    ...state,
    candidatesLoading: false,
  })),

  // --- mutations ---
  on(
    RepairOrdersActions.saveDiagnosis,
    RepairOrdersActions.setAssignees,
    RepairOrdersActions.sendQuote,
    RepairOrdersActions.advanceStatus,
    RepairOrdersActions.addNote,
    RepairOrdersActions.cancel,
    RepairOrdersActions.create,
    (state) => ({ ...state, saving: true, detailError: null }),
  ),
  on(RepairOrdersActions.saveSuccess, (state, { order }) => ({
    ...state,
    selected: order,
    saving: false,
    items: state.items.map((o) => (o.id === order.id ? order : o)),
  })),
  on(RepairOrdersActions.created, (state) => ({ ...state, saving: false })),
  on(RepairOrdersActions.saveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    detailError: error,
  })),
);
