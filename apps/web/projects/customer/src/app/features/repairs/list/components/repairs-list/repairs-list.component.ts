import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
  type RepairOrder,
} from "@car-garage/shared";
import { BadgeComponent } from "../../../../../shared";
import { REPAIR_STATUS_TONE } from "../../../repair-status";

@Component({
  selector: "cu-repairs-list",
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repairs-list.component.html",
  styleUrl: "./repairs-list.component.css",
})
export class RepairsListComponent {
  readonly repairs = input.required<RepairOrder[]>();

  protected readonly label = REPAIR_ORDER_STATUS_LABELS_DE;
  protected readonly tone = REPAIR_STATUS_TONE;
  protected readonly AwaitingDecision = RepairOrderStatus.QUOTE_PENDING_APPROVAL;

  vehicle(order: RepairOrder): string {
    const v = order.vehicle;
    const base = `${v.brandName} ${v.modelName}`;
    return v.licensePlate ? `${base} · ${v.licensePlate}` : base;
  }
}
