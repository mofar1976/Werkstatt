import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import type { WorkshopRole, WorkshopStatus } from "@car-garage/shared";
import { WorkshopsActions } from "./workshops.actions";
import type { AddMemberInput, WorkshopInput } from "./workshops.state";
import {
  selectDetailError,
  selectDetailLoading,
  selectSelectedWorkshop,
  selectWorkshopItems,
  selectWorkshopMembers,
  selectWorkshopQuery,
  selectWorkshopSaving,
  selectWorkshopTotal,
  selectWorkshopsError,
  selectWorkshopsLoading,
} from "./workshops.selectors";

@Injectable({ providedIn: "root" })
export class WorkshopsFacade {
  private readonly store = inject(Store);

  // list
  readonly items = this.store.selectSignal(selectWorkshopItems);
  readonly total = this.store.selectSignal(selectWorkshopTotal);
  readonly query = this.store.selectSignal(selectWorkshopQuery);
  readonly loading = this.store.selectSignal(selectWorkshopsLoading);
  readonly error = this.store.selectSignal(selectWorkshopsError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  // detail
  readonly selected = this.store.selectSignal(selectSelectedWorkshop);
  readonly members = this.store.selectSignal(selectWorkshopMembers);
  readonly detailLoading = this.store.selectSignal(selectDetailLoading);
  readonly saving = this.store.selectSignal(selectWorkshopSaving);
  readonly detailError = this.store.selectSignal(selectDetailError);

  open(): void {
    this.store.dispatch(WorkshopsActions.opened());
  }
  setSearch(search: string): void {
    this.store.dispatch(WorkshopsActions.searchChanged({ search }));
  }
  setStatus(status: WorkshopStatus | ""): void {
    this.store.dispatch(WorkshopsActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(WorkshopsActions.pageChanged({ page }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(WorkshopsActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(WorkshopsActions.leaveDetail());
  }

  create(input: WorkshopInput): void {
    this.store.dispatch(WorkshopsActions.create({ input }));
  }
  update(id: string, input: WorkshopInput): void {
    this.store.dispatch(WorkshopsActions.update({ id, input }));
  }
  toggleStatus(id: string, activate: boolean): void {
    this.store.dispatch(WorkshopsActions.toggleStatus({ id, activate }));
  }
  remove(id: string): void {
    this.store.dispatch(WorkshopsActions.delete({ id }));
  }

  addMember(workshopId: string, input: AddMemberInput): void {
    this.store.dispatch(WorkshopsActions.addMember({ workshopId, input }));
  }
  updateMemberRole(
    workshopId: string,
    memberId: string,
    role: WorkshopRole,
  ): void {
    this.store.dispatch(
      WorkshopsActions.updateMemberRole({ workshopId, memberId, role }),
    );
  }
  removeMember(workshopId: string, memberId: string): void {
    this.store.dispatch(WorkshopsActions.removeMember({ workshopId, memberId }));
  }
}
