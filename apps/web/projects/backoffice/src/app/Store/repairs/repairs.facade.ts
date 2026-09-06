import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { RepairsActions } from "./repairs.actions";
import type { RepairStatusFilter } from "./repairs.state";
import {
  selectRepairs,
  selectRepairsError,
  selectRepairsLoading,
  selectRepairsQuery,
  selectRepairsTotal,
} from "./repairs.selectors";

@Injectable({ providedIn: "root" })
export class RepairsFacade {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectRepairs);
  readonly total = this.store.selectSignal(selectRepairsTotal);
  readonly query = this.store.selectSignal(selectRepairsQuery);
  readonly loading = this.store.selectSignal(selectRepairsLoading);
  readonly error = this.store.selectSignal(selectRepairsError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  open(): void {
    this.store.dispatch(RepairsActions.opened());
  }
  setStatus(status: RepairStatusFilter): void {
    this.store.dispatch(RepairsActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(RepairsActions.pageChanged({ page }));
  }
}
