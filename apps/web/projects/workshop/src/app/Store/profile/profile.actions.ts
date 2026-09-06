import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { Workshop } from "@car-garage/shared";
import type { ProfileInput } from "./profile.state";

export const ProfileActions = createActionGroup({
  source: "Workshop Profile",
  events: {
    "Opened": emptyProps(),
    "Load": emptyProps(),
    "Load Success": props<{ workshop: Workshop }>(),
    "Load Failure": props<{ error: string }>(),

    "Save": props<{ input: ProfileInput }>(),
    "Save Success": props<{ workshop: Workshop }>(),
    "Save Failure": props<{ error: string }>(),
  },
});
