import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppointmentsActions } from "./appointments.actions";
import type { AppointmentStatusFilter } from "./appointments.state";
import {
  selectAppointmentDetailError,
  selectAppointmentDetailLoading,
  selectAppointmentQuery,
  selectAppointmentSaving,
  selectAppointmentTotal,
  selectAppointments,
  selectAppointmentsError,
  selectAppointmentsLoading,
  selectCalendarError,
  selectCalendarItems,
  selectCalendarLoading,
  selectCalendarMonth,
  selectSelectedAppointment,
} from "./appointments.selectors";

@Injectable({ providedIn: "root" })
export class AppointmentsFacade {
  private readonly store = inject(Store);

  // list
  readonly items = this.store.selectSignal(selectAppointments);
  readonly total = this.store.selectSignal(selectAppointmentTotal);
  readonly query = this.store.selectSignal(selectAppointmentQuery);
  readonly loading = this.store.selectSignal(selectAppointmentsLoading);
  readonly error = this.store.selectSignal(selectAppointmentsError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  // calendar
  readonly calendarMonth = this.store.selectSignal(selectCalendarMonth);
  readonly calendarItems = this.store.selectSignal(selectCalendarItems);
  readonly calendarLoading = this.store.selectSignal(selectCalendarLoading);
  readonly calendarError = this.store.selectSignal(selectCalendarError);

  // detail
  readonly selected = this.store.selectSignal(selectSelectedAppointment);
  readonly detailLoading = this.store.selectSignal(
    selectAppointmentDetailLoading,
  );
  readonly saving = this.store.selectSignal(selectAppointmentSaving);
  readonly detailError = this.store.selectSignal(selectAppointmentDetailError);

  open(): void {
    this.store.dispatch(AppointmentsActions.opened());
  }
  setStatus(status: AppointmentStatusFilter): void {
    this.store.dispatch(AppointmentsActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(AppointmentsActions.pageChanged({ page }));
  }

  openCalendar(): void {
    this.store.dispatch(AppointmentsActions.calendarOpened());
  }
  /** Move the calendar by whole months (e.g. -1 / +1). */
  shiftCalendarMonth(delta: number): void {
    const [year, m] = this.calendarMonth().split("-").map(Number);
    const d = new Date(year, m - 1 + delta, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    this.store.dispatch(AppointmentsActions.calendarMonthChanged({ month }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(AppointmentsActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(AppointmentsActions.leaveDetail());
  }

  cancel(id: string, reason?: string): void {
    this.store.dispatch(AppointmentsActions.cancel({ id, reason }));
  }
  complete(id: string): void {
    this.store.dispatch(AppointmentsActions.complete({ id }));
  }
}
