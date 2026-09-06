import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { AppointmentSlot } from "@car-garage/shared";
import type { CreateSlotInput } from "./availability.state";

export const AvailabilityActions = createActionGroup({
  source: "Availability",
  events: {
    "Opened": emptyProps(),
    "Load": emptyProps(),
    "Load Success": props<{ slots: AppointmentSlot[] }>(),
    "Load Failure": props<{ error: string }>(),
    "Leave": emptyProps(),

    "Create Slot": props<{ input: CreateSlotInput }>(),
    "Set Slot Status": props<{ slotId: string; status: "OPEN" | "BLOCKED" }>(),
    "Delete Slot": props<{ slotId: string }>(),
    "Slots Changed": props<{ slots: AppointmentSlot[] }>(),
    "Slot Save Failure": props<{ error: string }>(),
  },
});
