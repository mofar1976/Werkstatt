import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppointmentsActions } from "./appointments.actions";
import type { AppointmentStatusFilter } from "./appointments.state";
import {
  selectAppointments,
  selectAppointmentsError,
  selectAppointmentsLoading,
  selectAppointmentsQuery,
  selectAppointmentsTotal,
} from "./appointments.selectors";

@Injectable({ providedIn: "root" })
export class AppointmentsFacade {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectAppointments);
  readonly total = this.store.selectSignal(selectAppointmentsTotal);
  readonly query = this.store.selectSignal(selectAppointmentsQuery);
  readonly loading = this.store.selectSignal(selectAppointmentsLoading);
  readonly error = this.store.selectSignal(selectAppointmentsError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  open(): void {
    this.store.dispatch(AppointmentsActions.opened());
  }
  setStatus(status: AppointmentStatusFilter): void {
    this.store.dispatch(AppointmentsActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(AppointmentsActions.pageChanged({ page }));
  }
}
