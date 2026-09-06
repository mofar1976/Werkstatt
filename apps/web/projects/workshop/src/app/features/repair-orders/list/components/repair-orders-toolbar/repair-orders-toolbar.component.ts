import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
} from "@car-garage/shared";
import type { RepairStatusFilter } from "../../../../../Store/repair-orders";

/** Statuses worth filtering by in the workshop list. */
const FILTERABLE: RepairOrderStatus[] = [
  RepairOrderStatus.VEHICLE_RECEIVED,
  RepairOrderStatus.DIAGNOSIS_IN_PROGRESS,
  RepairOrderStatus.QUOTE_PENDING_APPROVAL,
  RepairOrderStatus.QUOTE_APPROVED,
  RepairOrderStatus.REPAIR_IN_PROGRESS,
  RepairOrderStatus.WAITING_FOR_PARTS,
  RepairOrderStatus.REPAIR_COMPLETED,
  RepairOrderStatus.READY_FOR_PICKUP,
  RepairOrderStatus.CLOSED,
  RepairOrderStatus.QUOTE_REJECTED,
  RepairOrderStatus.CANCELLED,
];

@Component({
  selector: "ws-repair-orders-toolbar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-orders-toolbar.component.html",
  styleUrl: "./repair-orders-toolbar.component.css",
})
export class RepairOrdersToolbarComponent {
  readonly statusChange = output<RepairStatusFilter>();

  protected readonly statuses = FILTERABLE;
  protected readonly labels = REPAIR_ORDER_STATUS_LABELS_DE;

  onStatus(value: string): void {
    this.statusChange.emit(value as RepairStatusFilter);
  }
}
