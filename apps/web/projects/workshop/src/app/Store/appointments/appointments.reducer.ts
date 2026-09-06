import { createReducer, on } from "@ngrx/store";
import { AppointmentsActions } from "./appointments.actions";
import { initialAppointmentsState } from "./appointments.state";

export const appointmentsReducer = createReducer(
  initialAppointmentsState,

  // --- list ---
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

  // --- calendar ---
  on(AppointmentsActions.calendarMonthChanged, (state, { month }) => ({
    ...state,
    calendarMonth: month,
  })),
  on(AppointmentsActions.loadCalendar, (state) => ({
    ...state,
    calendarLoading: true,
    calendarError: null,
  })),
  on(AppointmentsActions.loadCalendarSuccess, (state, { items }) => ({
    ...state,
    calendarItems: items,
    calendarLoading: false,
  })),
  on(AppointmentsActions.loadCalendarFailure, (state, { error }) => ({
    ...state,
    calendarLoading: false,
    calendarError: error,
  })),

  // --- detail ---
  on(AppointmentsActions.loadDetail, (state) => ({
    ...state,
    detailLoading: true,
    detailError: null,
    selected: null,
  })),
  on(AppointmentsActions.loadDetailSuccess, (state, { appointment }) => ({
    ...state,
    selected: appointment,
    detailLoading: false,
  })),
  on(AppointmentsActions.loadDetailFailure, (state, { error }) => ({
    ...state,
    detailLoading: false,
    detailError: error,
  })),
  on(AppointmentsActions.leaveDetail, (state) => ({
    ...state,
    selected: null,
    detailError: null,
    saving: false,
  })),

  // --- mutations ---
  on(AppointmentsActions.cancel, AppointmentsActions.complete, (state) => ({
    ...state,
    saving: true,
    detailError: null,
  })),
  on(AppointmentsActions.saveSuccess, (state, { appointment }) => ({
    ...state,
    selected: appointment,
    saving: false,
    items: state.items.map((a) => (a.id === appointment.id ? appointment : a)),
  })),
  on(AppointmentsActions.saveFailure, (state, { error }) => ({
    ...state,
    saving: false,
    detailError: error,
  })),
);
