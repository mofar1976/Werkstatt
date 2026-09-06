import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { RepairsActions } from "./repairs.actions";
import type { RepairStatusFilter } from "./repairs.state";
import {
  selectRepairDetailError,
  selectRepairDetailLoading,
  selectRepairSaving,
  selectRepairs,
  selectRepairsError,
  selectRepairsLoading,
  selectRepairsQuery,
  selectRepairsTotal,
  selectSelectedRepair,
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

  readonly selected = this.store.selectSignal(selectSelectedRepair);
  readonly detailLoading = this.store.selectSignal(selectRepairDetailLoading);
  readonly detailError = this.store.selectSignal(selectRepairDetailError);
  readonly saving = this.store.selectSignal(selectRepairSaving);

  open(): void {
    this.store.dispatch(RepairsActions.opened());
  }
  setStatus(status: RepairStatusFilter): void {
    this.store.dispatch(RepairsActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(RepairsActions.pageChanged({ page }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(RepairsActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(RepairsActions.leaveDetail());
  }

  approve(id: string): void {
    this.store.dispatch(RepairsActions.approveQuote({ id }));
  }
  reject(id: string, reason?: string): void {
    this.store.dispatch(RepairsActions.rejectQuote({ id, reason }));
  }
}
