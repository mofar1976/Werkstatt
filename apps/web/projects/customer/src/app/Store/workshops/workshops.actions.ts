import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { PublicWorkshop } from "@car-garage/shared";

export const WorkshopsActions = createActionGroup({
  source: "Workshops",
  events: {
    "Opened": emptyProps(),
    "Search Changed": props<{ search: string }>(),
    "Near Changed": props<{ lat: number; lng: number; radiusKm?: number }>(),
    "Near Cleared": emptyProps(),
    "Load": emptyProps(),
    "Load Success": props<{ items: PublicWorkshop[] }>(),
    "Load Failure": props<{ error: string }>(),

    "Focus": props<{ id: string | null }>(),

    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{ workshop: PublicWorkshop }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),
  },
});
