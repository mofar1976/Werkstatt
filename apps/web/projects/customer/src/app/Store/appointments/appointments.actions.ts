import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { Appointment } from "@car-garage/shared";
import type { AppointmentStatusFilter } from "./appointments.state";

export const AppointmentsActions = createActionGroup({
  source: "Customer Appointments",
  events: {
    // --- list ---
    "Opened": emptyProps(),
    "Status Changed": props<{ status: AppointmentStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: Appointment[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- detail ---
    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{ appointment: Appointment }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),

    // --- cancel ---
    "Cancel": props<{ id: string; reason?: string }>(),
    "Cancel Success": props<{ appointment: Appointment }>(),
    "Cancel Failure": props<{ error: string }>(),
  },
});
