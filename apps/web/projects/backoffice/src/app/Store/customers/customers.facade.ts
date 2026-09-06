import { Injectable, computed, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { CustomersActions } from "./customers.actions";
import type { CustomerInput, CustomerStatusFilter } from "./customers.state";
import {
  selectCustomerDetailError,
  selectCustomerDetailLoading,
  selectCustomerQuery,
  selectCustomerSaving,
  selectCustomerTotal,
  selectCustomers,
  selectCustomersError,
  selectCustomersLoading,
  selectSelectedCustomer,
} from "./customers.selectors";

@Injectable({ providedIn: "root" })
export class CustomersFacade {
  private readonly store = inject(Store);

  // list
  readonly items = this.store.selectSignal(selectCustomers);
  readonly total = this.store.selectSignal(selectCustomerTotal);
  readonly query = this.store.selectSignal(selectCustomerQuery);
  readonly loading = this.store.selectSignal(selectCustomersLoading);
  readonly error = this.store.selectSignal(selectCustomersError);
  readonly page = computed(() => this.query().page);
  readonly pageSize = computed(() => this.query().pageSize);

  // detail
  readonly selected = this.store.selectSignal(selectSelectedCustomer);
  readonly detailLoading = this.store.selectSignal(selectCustomerDetailLoading);
  readonly saving = this.store.selectSignal(selectCustomerSaving);
  readonly detailError = this.store.selectSignal(selectCustomerDetailError);

  open(): void {
    this.store.dispatch(CustomersActions.opened());
  }
  setSearch(search: string): void {
    this.store.dispatch(CustomersActions.searchChanged({ search }));
  }
  setStatus(status: CustomerStatusFilter): void {
    this.store.dispatch(CustomersActions.statusChanged({ status }));
  }
  setPage(page: number): void {
    this.store.dispatch(CustomersActions.pageChanged({ page }));
  }

  loadDetail(id: string): void {
    this.store.dispatch(CustomersActions.loadDetail({ id }));
  }
  leaveDetail(): void {
    this.store.dispatch(CustomersActions.leaveDetail());
  }

  update(id: string, input: CustomerInput): void {
    this.store.dispatch(CustomersActions.update({ id, input }));
  }
  setBlocked(id: string, blocked: boolean): void {
    this.store.dispatch(CustomersActions.setBlocked({ id, blocked }));
  }
  remove(id: string): void {
    this.store.dispatch(CustomersActions.delete({ id }));
  }
}
