/**
 * Domain enums shared between API and web.
 * Kept free of framework imports so both the Express API and the Angular apps
 * can consume them. These are the single source of truth for these string
 * values across the codebase (API validation, DB, and UI).
 */

/**
 * Which portal a person authenticates against. Each of the three Angular apps
 * has its own login; an account belongs to exactly one audience.
 */
export const AuthAudience = {
  ADMIN: "ADMIN",
  WORKSHOP: "WORKSHOP",
  CUSTOMER: "CUSTOMER",
} as const;
export type AuthAudience = (typeof AuthAudience)[keyof typeof AuthAudience];

/** Who a person is on the platform. A user can hold more than one role. */
export const UserRole = {
  CUSTOMER: "CUSTOMER",
  WORKSHOP_MEMBER: "WORKSHOP_MEMBER",
  WORKSHOP_ADMIN: "WORKSHOP_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * A person's role within a single workshop.
 * - `MEMBER`: mechanic — repairs cars.
 * - `CHEF`: the boss — can also add, edit and remove members.
 */
export const WorkshopRole = {
  MEMBER: "MEMBER",
  CHEF: "CHEF",
} as const;
export type WorkshopRole = (typeof WorkshopRole)[keyof typeof WorkshopRole];

/** Onboarding state of a workshop on the platform. */
export const WorkshopStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type WorkshopStatus =
  (typeof WorkshopStatus)[keyof typeof WorkshopStatus];

/** German UI labels for workshop statuses. */
export const WORKSHOP_STATUS_LABELS_DE: Record<WorkshopStatus, string> = {
  PENDING: "Ausstehend",
  ACTIVE: "Aktiv",
  SUSPENDED: "Gesperrt",
};

/**
 * A bookable time slot published by a workshop.
 * - `OPEN`: free, a customer can book it.
 * - `BOOKED`: a customer has booked it (booking is immediately binding).
 * - `BLOCKED`: taken out of availability by the workshop.
 */
export const AppointmentSlotStatus = {
  OPEN: "OPEN",
  BOOKED: "BOOKED",
  BLOCKED: "BLOCKED",
} as const;
export type AppointmentSlotStatus =
  (typeof AppointmentSlotStatus)[keyof typeof AppointmentSlotStatus];

/** German UI labels for slot statuses. */
export const APPOINTMENT_SLOT_STATUS_LABELS_DE: Record<
  AppointmentSlotStatus,
  string
> = {
  OPEN: "Frei",
  BOOKED: "Gebucht",
  BLOCKED: "Blockiert",
};

/**
 * Lifecycle of an appointment. Booking a free slot is immediately binding, so
 * there is no request/decline step — an appointment starts `CONFIRMED`.
 */
export const AppointmentStatus = {
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

/** German UI labels for appointment statuses. */
export const APPOINTMENT_STATUS_LABELS_DE: Record<AppointmentStatus, string> = {
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
  COMPLETED: "Abgeschlossen",
};

/** Who cancelled an appointment. */
export const AppointmentActor = {
  CUSTOMER: "CUSTOMER",
  WORKSHOP: "WORKSHOP",
} as const;
export type AppointmentActor =
  (typeof AppointmentActor)[keyof typeof AppointmentActor];

/**
 * Lifecycle of a repair order. This is the backbone of the timeline the
 * customer follows. Order matters: see REPAIR_ORDER_FLOW below.
 */
export const RepairOrderStatus = {
  /** Appointment confirmed; waiting for the customer to describe car + problem. */
  INTAKE_PENDING: "INTAKE_PENDING",
  /** Customer submitted vehicle data and problem description. */
  INTAKE_SUBMITTED: "INTAKE_SUBMITTED",
  /** Car physically handed over and checked in at the workshop. */
  VEHICLE_RECEIVED: "VEHICLE_RECEIVED",
  /** Workshop is inspecting the car and preparing a cost estimate. */
  DIAGNOSIS_IN_PROGRESS: "DIAGNOSIS_IN_PROGRESS",
  /** Estimate (cause, parts, labour, price) sent to the customer. */
  QUOTE_PENDING_APPROVAL: "QUOTE_PENDING_APPROVAL",
  /** Customer approved the estimate. */
  QUOTE_APPROVED: "QUOTE_APPROVED",
  /** Customer rejected the estimate. */
  QUOTE_REJECTED: "QUOTE_REJECTED",
  /** Repair work is underway. */
  REPAIR_IN_PROGRESS: "REPAIR_IN_PROGRESS",
  /** Repair paused: waiting for ordered parts to arrive. */
  WAITING_FOR_PARTS: "WAITING_FOR_PARTS",
  /** Repair finished; final checks / cleaning. */
  REPAIR_COMPLETED: "REPAIR_COMPLETED",
  /** Car is ready for the customer to pick up. */
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  /** Car handed back and paid. */
  CLOSED: "CLOSED",
  /** Order stopped before completion (by either side). */
  CANCELLED: "CANCELLED",
} as const;
export type RepairOrderStatus =
  (typeof RepairOrderStatus)[keyof typeof RepairOrderStatus];

/** Happy-path ordering of repair-order statuses, for progress bars / timelines. */
export const REPAIR_ORDER_FLOW: RepairOrderStatus[] = [
  RepairOrderStatus.INTAKE_PENDING,
  RepairOrderStatus.INTAKE_SUBMITTED,
  RepairOrderStatus.VEHICLE_RECEIVED,
  RepairOrderStatus.DIAGNOSIS_IN_PROGRESS,
  RepairOrderStatus.QUOTE_PENDING_APPROVAL,
  RepairOrderStatus.QUOTE_APPROVED,
  RepairOrderStatus.REPAIR_IN_PROGRESS,
  RepairOrderStatus.REPAIR_COMPLETED,
  RepairOrderStatus.READY_FOR_PICKUP,
  RepairOrderStatus.CLOSED,
];

/** Lifecycle of a cost estimate (Kostenvoranschlag). */
export const QuoteStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;
export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

/** A single line on an estimate: a part to replace or a labour position. */
export const LineItemKind = {
  PART: "PART",
  LABOR: "LABOR",
} as const;
export type LineItemKind = (typeof LineItemKind)[keyof typeof LineItemKind];

/** For a part line item: whether the part is replaced or repaired. */
export const PartAction = {
  REPLACE: "REPLACE",
  REPAIR: "REPAIR",
} as const;
export type PartAction = (typeof PartAction)[keyof typeof PartAction];

/** What a stored file is attached to / used for. */
export const AttachmentCategory = {
  INTAKE: "INTAKE",
  DIAGNOSIS: "DIAGNOSIS",
  PROGRESS: "PROGRESS",
  DOCUMENT: "DOCUMENT",
  OTHER: "OTHER",
} as const;
export type AttachmentCategory =
  (typeof AttachmentCategory)[keyof typeof AttachmentCategory];

/** Kind of entry on a repair-order timeline. */
export const TimelineEventType = {
  ORDER_CREATED: "ORDER_CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  NOTE_ADDED: "NOTE_ADDED",
  INTAKE_SUBMITTED: "INTAKE_SUBMITTED",
  VEHICLE_RECEIVED: "VEHICLE_RECEIVED",
  DIAGNOSIS_ADDED: "DIAGNOSIS_ADDED",
  QUOTE_SENT: "QUOTE_SENT",
  QUOTE_APPROVED: "QUOTE_APPROVED",
  QUOTE_REJECTED: "QUOTE_REJECTED",
  ATTACHMENT_ADDED: "ATTACHMENT_ADDED",
} as const;
export type TimelineEventType =
  (typeof TimelineEventType)[keyof typeof TimelineEventType];

/** Who caused a timeline event. */
export const TimelineActor = {
  WORKSHOP: "WORKSHOP",
  CUSTOMER: "CUSTOMER",
  SYSTEM: "SYSTEM",
} as const;
export type TimelineActor =
  (typeof TimelineActor)[keyof typeof TimelineActor];

/** Reason a notification was sent to a user. */
export const NotificationType = {
  APPOINTMENT_REQUESTED: "APPOINTMENT_REQUESTED",
  APPOINTMENT_CONFIRMED: "APPOINTMENT_CONFIRMED",
  APPOINTMENT_DECLINED: "APPOINTMENT_DECLINED",
  INTAKE_REMINDER: "INTAKE_REMINDER",
  QUOTE_READY: "QUOTE_READY",
  QUOTE_DECISION: "QUOTE_DECISION",
  STATUS_UPDATE: "STATUS_UPDATE",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

/** German UI labels for repair-order statuses. Central so screens stay in sync. */
export const REPAIR_ORDER_STATUS_LABELS_DE: Record<RepairOrderStatus, string> = {
  INTAKE_PENDING: "Warten auf Fahrzeugdaten",
  INTAKE_SUBMITTED: "Fahrzeugdaten erfasst",
  VEHICLE_RECEIVED: "Fahrzeug angenommen",
  DIAGNOSIS_IN_PROGRESS: "Diagnose läuft",
  QUOTE_PENDING_APPROVAL: "Kostenvoranschlag zur Freigabe",
  QUOTE_APPROVED: "Kostenvoranschlag freigegeben",
  QUOTE_REJECTED: "Kostenvoranschlag abgelehnt",
  REPAIR_IN_PROGRESS: "Fahrzeug wird repariert",
  WAITING_FOR_PARTS: "Warten auf Teile",
  REPAIR_COMPLETED: "Reparatur abgeschlossen",
  READY_FOR_PICKUP: "Bereit zur Abholung",
  CLOSED: "Abgeschlossen",
  CANCELLED: "Storniert",
};
