import type { AppointmentSlot } from "@car-garage/shared";

export const AVAILABILITY_FEATURE_KEY = "availability";

export interface CreateSlotInput {
  /** ISO string with offset. */
  startsAt: string;
  durationMinutes: number;
}

export interface AvailabilityState {
  slots: AppointmentSlot[];
  loading: boolean;
  error: string | null;
  saving: boolean;
}

export const initialAvailabilityState: AvailabilityState = {
  slots: [],
  loading: false,
  error: null,
  saving: false,
};
