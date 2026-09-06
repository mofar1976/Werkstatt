import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { DashboardActions } from "./dashboard.actions";
import {
  selectDashboardError,
  selectDashboardLoading,
  selectOverview,
} from "./dashboard.selectors";

@Injectable({ providedIn: "root" })
export class DashboardFacade {
  private readonly store = inject(Store);

  readonly overview = this.store.selectSignal(selectOverview);
  readonly loading = this.store.selectSignal(selectDashboardLoading);
  readonly error = this.store.selectSignal(selectDashboardError);

  open(): void {
    this.store.dispatch(DashboardActions.opened());
  }
}
