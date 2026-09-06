import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type {
  Appointment,
  BookAppointmentRequest,
  CarBrand,
  CarModel,
  PublicSlot,
  PublicWorkshop,
} from "@car-garage/shared";

export const BookingActions = createActionGroup({
  source: "Booking",
  events: {
    "Opened": props<{ workshopId: string }>(),
    "Load Success": props<{
      workshop: PublicWorkshop;
      slots: PublicSlot[];
      brands: CarBrand[];
    }>(),
    "Load Failure": props<{ error: string }>(),

    "Brand Selected": props<{ brandId: string }>(),
    "Models Loaded": props<{ brandId: string; models: CarModel[] }>(),
    "Models Failed": props<{ error: string }>(),

    "Submit": props<{ input: BookAppointmentRequest }>(),
    "Submit Success": props<{ appointment: Appointment }>(),
    "Submit Failure": props<{ error: string }>(),

    "Slots Reloaded": props<{ slots: PublicSlot[] }>(),

    "Left": emptyProps(),
  },
});
