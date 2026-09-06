import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { RepairOrdersActions } from "./repair-orders.actions";
import type { DiagnosisInput, RepairStatusFilter } from "./repair-orders.state";
import {
  selectRepairOrderDetailError,
  selectRepairOrderDetailLoading,
  selectRepairOrderQuery,
  selectRepairOrderSaving,
  selectRepairOrderTotal,
  selectRepairOrders,
  selectRepairCandidates,
  selectRepairCandidatesLoading,
  selectRepairOrdersError,
  selectRepairOrdersLoading,
  selectRepairTeamMembers,
  selectSelectedRepairOrder,
} from "./repair-orders.selectors";

@Injectable({ providedIn: "root" })
export class RepairOrdersFacade {
  private readonly store = inject(Store);

  // list
  readonly items = this.store.selectSignal(selectRepairOrders);
  readonly total = this.store.selectSignal(selectRepairOrderTotal);
  readonly query = this.store.selectSignal(selectRepairOrderQuery);
  readonly loading = this.store.selectSignal(selectRepairOrdersLoading);
  readonly error = this.store.selectSignal(selectRepairOrdersError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  // detail
  readonly selected = this.store.selectSignal(selectSelectedRepairOrder);
  readonly detailLoading = this.store.selectSignal(
    selectRepairOrderDetailLoading,
  );
  readonly saving = this.store.selectSignal(selectRepairOrderSaving);
  readonly detailError = this.store.selectSignal(selectRepairOrderDetailError);
  readonly teamMembers = this.store.selectSignal(selectRepairTeamMembers);
  readonly candidates = this.store.selectSignal(selectRepairCandidates);
  readonly candidatesLoading = this.store.selectSignal(
    selectRepairCandidatesLoading,
  );

  open(): void {
    this.store.dispatch(RepairOrdersActions.opened());
  }
  setStatus(status: RepairStatusFilter): void {
    this.store.dispatch(RepairOrdersActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(RepairOrdersActions.pageChanged({ page }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(RepairOrdersActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(RepairOrdersActions.leaveDetail());
  }

  loadCandidates(): void {
    this.store.dispatch(RepairOrdersActions.loadCandidates());
  }

  create(appointmentId: string): void {
    this.store.dispatch(RepairOrdersActions.create({ appointmentId }));
  }

  saveDiagnosis(id: string, input: DiagnosisInput): void {
    this.store.dispatch(RepairOrdersActions.saveDiagnosis({ id, input }));
  }
  setAssignees(id: string, memberIds: string[]): void {
    this.store.dispatch(RepairOrdersActions.setAssignees({ id, memberIds }));
  }
  sendQuote(id: string): void {
    this.store.dispatch(RepairOrdersActions.sendQuote({ id }));
  }
  advanceStatus(id: string, status: string, note?: string): void {
    this.store.dispatch(RepairOrdersActions.advanceStatus({ id, status, note }));
  }
  addNote(id: string, message: string): void {
    this.store.dispatch(RepairOrdersActions.addNote({ id, message }));
  }
  cancel(id: string, reason?: string): void {
    this.store.dispatch(RepairOrdersActions.cancel({ id, reason }));
  }
}
