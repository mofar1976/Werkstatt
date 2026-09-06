import type {
  LineItemKind,
  PartAction,
  QuoteStatus,
  RepairOrderStatus,
  TimelineActor,
  TimelineEventType,
} from "./enums";
import type { AppointmentCustomer, AppointmentVehicle } from "./appointment";

/** One line on the cost estimate: a part or a labour position. */
export interface RepairLineItem {
  kind: LineItemKind;
  /** Only for `kind === "PART"`: whether the part is replaced or repaired. */
  partAction?: PartAction;
  description: string;
  /** Pieces for a PART, hours for LABOR. */
  quantity: number;
  /** Net price per unit, in cents. */
  unitPriceCents: number;
  /** `round(quantity * unitPriceCents)`. */
  lineTotalCents: number;
}

/** Cost estimate (Kostenvoranschlag) — embedded in the repair order. */
export interface RepairQuote {
  status: QuoteStatus;
  lineItems: RepairLineItem[];
  /** VAT rate applied to the net total, e.g. 19. */
  taxRatePercent: number;
  netCents: number;
  taxCents: number;
  grossCents: number;
  /** Free-text note shown to the customer with the estimate. */
  notes?: string;
  sentAt?: string;
  decidedAt?: string;
  rejectionReason?: string;
}

/** A workshop member assigned to a repair order. */
export interface RepairAssignee {
  id: string;
  firstName: string;
  lastName: string;
}

export interface RepairOrder {
  id: string;
  appointmentId: string;
  workshopId: string;
  workshopName: string;
  customerId: string;
  /** Present only on the workshop-facing views. */
  customer?: AppointmentCustomer;
  vehicle: AppointmentVehicle;
  problemDescription: string;
  status: RepairOrderStatus;
  /** Diagnosis: what the workshop found to be the cause. */
  cause?: string;
  assignedMembers: RepairAssignee[];
  quote: RepairQuote;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** One immutable entry on a repair order's timeline. */
export interface RepairTimelineEvent {
  id: string;
  type: TimelineEventType;
  /** Set for `STATUS_CHANGED`. */
  status?: RepairOrderStatus;
  message?: string;
  actor: TimelineActor;
  actorName?: string;
  createdAt: string;
}

export interface RepairOrderDetail extends RepairOrder {
  timeline: RepairTimelineEvent[];
}
