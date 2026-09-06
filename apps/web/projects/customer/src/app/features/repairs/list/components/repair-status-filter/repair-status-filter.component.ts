import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { REPAIR_ORDER_STATUS_LABELS_DE } from "@car-garage/shared";
import type { RepairStatusFilter } from "../../../../../Store/repairs";
import { REPAIR_FILTER_STATUSES } from "../../../repair-status";

@Component({
  selector: "cu-repair-status-filter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-status-filter.component.html",
  styleUrl: "./repair-status-filter.component.css",
})
export class RepairStatusFilterComponent {
  readonly status = input<RepairStatusFilter>("");
  readonly statusChange = output<RepairStatusFilter>();

  protected readonly statuses = REPAIR_FILTER_STATUSES;
  protected readonly labels = REPAIR_ORDER_STATUS_LABELS_DE;

  onChange(value: string): void {
    this.statusChange.emit(value as RepairStatusFilter);
  }
}
