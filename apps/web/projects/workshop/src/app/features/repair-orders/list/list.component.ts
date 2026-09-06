import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  AlertComponent,
  ButtonComponent,
  PaginationComponent,
  SpinnerComponent,
} from "../../../shared";
import { RepairOrdersFacade } from "../../../Store/repair-orders";
import { RepairOrdersToolbarComponent } from "./components/repair-orders-toolbar/repair-orders-toolbar.component";
import { RepairOrdersTableComponent } from "./components/repair-orders-table/repair-orders-table.component";
import { NewOrderPanelComponent } from "./components/new-order-panel/new-order-panel.component";

@Component({
  selector: "ws-repair-order-list",
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    PaginationComponent,
    SpinnerComponent,
    RepairOrdersToolbarComponent,
    RepairOrdersTableComponent,
    NewOrderPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./list.component.html",
})
export class RepairOrderListComponent {
  protected readonly facade = inject(RepairOrdersFacade);
  protected readonly showNewOrder = signal(false);

  constructor() {
    this.facade.open();
  }

  toggleNewOrder(): void {
    const next = !this.showNewOrder();
    this.showNewOrder.set(next);
    if (next) this.facade.loadCandidates();
  }

  pick(appointmentId: string): void {
    this.facade.create(appointmentId);
  }
}
