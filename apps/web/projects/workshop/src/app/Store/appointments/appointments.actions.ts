import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { Appointment } from "@car-garage/shared";
import type { AppointmentStatusFilter } from "./appointments.state";

export const AppointmentsActions = createActionGroup({
  source: "Appointments",
  events: {
    // --- list ---
    "Opened": emptyProps(),
    "Status Changed": props<{ status: AppointmentStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: Appointment[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- calendar (month overview) ---
    "Calendar Opened": emptyProps(),
    "Calendar Month Changed": props<{ month: string }>(),
    "Load Calendar": emptyProps(),
    "Load Calendar Success": props<{ items: Appointment[] }>(),
    "Load Calendar Failure": props<{ error: string }>(),

    // --- detail ---
    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{ appointment: Appointment }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),

    // --- mutations ---
    "Cancel": props<{ id: string; reason?: string }>(),
    "Complete": props<{ id: string }>(),
    "Save Success": props<{ appointment: Appointment }>(),
    "Save Failure": props<{ error: string }>(),
  },
});
