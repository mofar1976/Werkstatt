import type {
  CarBrand,
  CarModel,
  PublicSlot,
  PublicWorkshop,
} from "@car-garage/shared";

export const BOOKING_FEATURE_KEY = "booking";

export interface BookingState {
  workshopId: string | null;
  workshop: PublicWorkshop | null;
  slots: PublicSlot[];
  brands: CarBrand[];
  /** Models of the currently selected brand. */
  models: CarModel[];
  selectedBrandId: string | null;
  loading: boolean;
  error: string | null;
  modelsLoading: boolean;
  submitting: boolean;
  submitError: string | null;
  /** Id of the appointment created by a successful booking. */
  bookedAppointmentId: string | null;
}

export const initialBookingState: BookingState = {
  workshopId: null,
  workshop: null,
  slots: [],
  brands: [],
  models: [],
  selectedBrandId: null,
  loading: false,
  error: null,
  modelsLoading: false,
  submitting: false,
  submitError: null,
  bookedAppointmentId: null,
};
