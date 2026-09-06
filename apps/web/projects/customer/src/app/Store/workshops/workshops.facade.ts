import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { WorkshopsActions } from "./workshops.actions";
import {
  selectFocusedWorkshopId,
  selectSelectedWorkshop,
  selectWorkshopDetailError,
  selectWorkshopDetailLoading,
  selectWorkshops,
  selectWorkshopsError,
  selectWorkshopsLoading,
  selectWorkshopsQuery,
} from "./workshops.selectors";

@Injectable({ providedIn: "root" })
export class WorkshopsFacade {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectWorkshops);
  readonly query = this.store.selectSignal(selectWorkshopsQuery);
  readonly loading = this.store.selectSignal(selectWorkshopsLoading);
  readonly error = this.store.selectSignal(selectWorkshopsError);
  readonly focusedId = this.store.selectSignal(selectFocusedWorkshopId);

  readonly selected = this.store.selectSignal(selectSelectedWorkshop);
  readonly detailLoading = this.store.selectSignal(selectWorkshopDetailLoading);
  readonly detailError = this.store.selectSignal(selectWorkshopDetailError);

  open(): void {
    this.store.dispatch(WorkshopsActions.opened());
  }
  setSearch(search: string): void {
    this.store.dispatch(WorkshopsActions.searchChanged({ search }));
  }
  searchNear(lat: number, lng: number, radiusKm?: number): void {
    this.store.dispatch(WorkshopsActions.nearChanged({ lat, lng, radiusKm }));
  }
  clearNear(): void {
    this.store.dispatch(WorkshopsActions.nearCleared());
  }
  focus(id: string | null): void {
    this.store.dispatch(WorkshopsActions.focus({ id }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(WorkshopsActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(WorkshopsActions.leaveDetail());
  }
}
