import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  REPAIR_ORDER_STATUS_LABELS_DE,
  RepairOrderStatus,
  type RepairOrder,
} from "@car-garage/shared";
import { BadgeComponent, formatEur, type BadgeTone } from "../../../../../shared";

const TONE: Record<RepairOrderStatus, BadgeTone> = {
  INTAKE_PENDING: "gray",
  INTAKE_SUBMITTED: "gray",
  VEHICLE_RECEIVED: "blue",
  DIAGNOSIS_IN_PROGRESS: "blue",
  QUOTE_PENDING_APPROVAL: "amber",
  QUOTE_APPROVED: "blue",
  QUOTE_REJECTED: "red",
  REPAIR_IN_PROGRESS: "blue",
  WAITING_FOR_PARTS: "amber",
  REPAIR_COMPLETED: "green",
  READY_FOR_PICKUP: "green",
  CLOSED: "gray",
  CANCELLED: "gray",
};

@Component({
  selector: "ws-repair-orders-table",
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./repair-orders-table.component.html",
  styleUrl: "./repair-orders-table.component.css",
})
export class RepairOrdersTableComponent {
  readonly orders = input.required<RepairOrder[]>();

  protected readonly label = REPAIR_ORDER_STATUS_LABELS_DE;
  protected readonly eur = formatEur;

  tone(status: RepairOrderStatus): BadgeTone {
    return TONE[status];
  }

  customerName(order: RepairOrder): string {
    return order.customer
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : "—";
  }
}
