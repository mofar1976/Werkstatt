import {
  AppointmentStatus,
  RepairOrderStatus,
  type AppointmentStatus as AppointmentStatusT,
  type RepairOrderStatus as RepairOrderStatusT,
} from "@car-garage/shared";
import type { BadgeTone } from "../ui/badge/badge.component";

/** Badge colour per appointment status. */
const APPOINTMENT_TONE: Record<AppointmentStatusT, BadgeTone> = {
  [AppointmentStatus.CONFIRMED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "gray",
};

/** Badge colour per repair-order status. */
const REPAIR_TONE: Record<RepairOrderStatusT, BadgeTone> = {
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

export function appointmentStatusTone(status: AppointmentStatusT): BadgeTone {
  return APPOINTMENT_TONE[status];
}

export function repairStatusTone(status: RepairOrderStatusT): BadgeTone {
  return REPAIR_TONE[status];
}
