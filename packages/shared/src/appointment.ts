import type {
  AppointmentActor,
  AppointmentSlotStatus,
  AppointmentStatus,
} from "./enums";

export interface AppointmentSlot {
  id: string;
  workshopId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentSlotStatus;
  /** Set when the slot is BOOKED. */
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

/** Free slot as shown to a customer (always OPEN and in the future). */
export interface PublicSlot {
  id: string;
  workshopId: string;
  startsAt: string;
  endsAt: string;
}

/** Car details captured with a booking (denormalised — no Vehicle entity yet). */
export interface AppointmentVehicle {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  licensePlate?: string;
}

/** Customer contact shown to the workshop on an appointment. */
export interface AppointmentCustomer {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
}

export interface Appointment {
  id: string;
  workshopId: string;
  /** Denormalised so an appointment stays readable on its own. */
  workshopName: string;
  customerId: string;
  /** Present only on the workshop-facing views. */
  customer?: AppointmentCustomer;
  slotId: string;
  scheduledAt: string;
  problemDescription: string;
  vehicle: AppointmentVehicle;
  status: AppointmentStatus;
  cancelledBy?: AppointmentActor;
  cancelReason?: string;
  /** Set on the workshop detail view once a repair order exists for this appointment. */
  repairOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentRequest {
  slotId: string;
  problemDescription: string;
  vehicle: {
    brandId: string;
    modelId: string;
    licensePlate?: string;
  };
}
