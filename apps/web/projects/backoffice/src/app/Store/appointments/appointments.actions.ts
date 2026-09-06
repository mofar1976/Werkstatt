import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { Appointment } from "@car-garage/shared";
import type { AppointmentStatusFilter } from "./appointments.state";

export const AppointmentsActions = createActionGroup({
  source: "Admin Appointments",
  events: {
    "Opened": emptyProps(),
    "Status Changed": props<{ status: AppointmentStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: Appointment[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),
  },
});
