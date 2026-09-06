import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
} from "@car-garage/shared";
import type { RepairStatusFilter } from "../../../../../Store/repairs";

/** Statuses worth filtering by in the platform-wide list. */
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
  selector: "bo-repairs-toolbar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repairs-toolbar.component.html",
  styleUrl: "./repairs-toolbar.component.css",
})
export class RepairsToolbarComponent {
  readonly statusChange = output<RepairStatusFilter>();

  protected readonly statuses = FILTERABLE;
  protected readonly labels = REPAIR_ORDER_STATUS_LABELS_DE;

  onStatus(value: string): void {
    this.statusChange.emit(value as RepairStatusFilter);
  }
}
