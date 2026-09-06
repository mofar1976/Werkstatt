import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  type RepairOrderDetail,
} from "@car-garage/shared";
import { BadgeComponent } from "../../../../../shared";
import { REPAIR_STATUS_TONE } from "../../../repair-status";

@Component({
  selector: "cu-repair-info",
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-info.component.html",
  styleUrl: "./repair-info.component.css",
})
export class RepairInfoComponent {
  readonly order = input.required<RepairOrderDetail>();

  protected readonly label = REPAIR_ORDER_STATUS_LABELS_DE;
  protected readonly tone = REPAIR_STATUS_TONE;

  vehicle(order: RepairOrderDetail): string {
    const v = order.vehicle;
    return v.licensePlate
      ? `${v.brandName} ${v.modelName} · ${v.licensePlate}`
      : `${v.brandName} ${v.modelName}`;
  }
}
