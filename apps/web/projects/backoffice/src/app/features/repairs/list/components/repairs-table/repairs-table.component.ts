import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  type RepairOrder,
} from "@car-garage/shared";
import {
  BadgeComponent,
  formatEur,
  repairStatusTone,
} from "../../../../../shared";

@Component({
  selector: "bo-repairs-table",
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repairs-table.component.html",
  styleUrl: "./repairs-table.component.css",
})
export class RepairsTableComponent {
  readonly orders = input.required<RepairOrder[]>();

  protected readonly label = REPAIR_ORDER_STATUS_LABELS_DE;
  protected readonly tone = repairStatusTone;
  protected readonly eur = formatEur;

  vehicle(order: RepairOrder): string {
    const v = order.vehicle;
    return v.licensePlate
      ? `${v.brandName} ${v.modelName} · ${v.licensePlate}`
      : `${v.brandName} ${v.modelName}`;
  }
}
