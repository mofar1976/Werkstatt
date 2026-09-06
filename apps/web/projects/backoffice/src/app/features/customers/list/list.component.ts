import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  AlertComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { CustomersFacade } from "../../../Store/customers";
import { CustomersToolbarComponent } from "./components/customers-toolbar/customers-toolbar.component";
import { CustomersTableComponent } from "./components/customers-table/customers-table.component";

@Component({
  selector: "bo-customer-list",
  standalone: true,
  imports: [
    AlertComponent,
    PaginationComponent,
    SpinnerComponent,
    CustomersToolbarComponent,
    CustomersTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class CustomerListComponent {
  protected readonly facade = inject(CustomersFacade);

  constructor() {
    this.facade.open();
  }
}
