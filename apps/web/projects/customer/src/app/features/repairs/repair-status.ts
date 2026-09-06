import { RepairOrderStatus } from "@car-garage/shared";
import type { BadgeTone } from "../../shared";

/** Badge colour per repair-order status, shared by the list and the detail view. */
export const REPAIR_STATUS_TONE: Record<RepairOrderStatus, BadgeTone> = {
  [RepairOrderStatus.INTAKE_PENDING]: "gray",
  [RepairOrderStatus.INTAKE_SUBMITTED]: "gray",
  [RepairOrderStatus.VEHICLE_RECEIVED]: "blue",
  [RepairOrderStatus.DIAGNOSIS_IN_PROGRESS]: "blue",
  [RepairOrderStatus.QUOTE_PENDING_APPROVAL]: "amber",
  [RepairOrderStatus.QUOTE_APPROVED]: "blue",
  [RepairOrderStatus.QUOTE_REJECTED]: "red",
  [RepairOrderStatus.REPAIR_IN_PROGRESS]: "blue",
  [RepairOrderStatus.WAITING_FOR_PARTS]: "amber",
  [RepairOrderStatus.REPAIR_COMPLETED]: "green",
  [RepairOrderStatus.READY_FOR_PICKUP]: "green",
  [RepairOrderStatus.CLOSED]: "gray",
  [RepairOrderStatus.CANCELLED]: "gray",
};

/** Statuses worth offering as a filter in the customer's repair list. */
export const REPAIR_FILTER_STATUSES: RepairOrderStatus[] = [
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
