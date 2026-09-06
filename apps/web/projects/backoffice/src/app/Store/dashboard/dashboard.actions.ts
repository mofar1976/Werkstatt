import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { AdminOverview } from "@car-garage/shared";

export const DashboardActions = createActionGroup({
  source: "Dashboard",
  events: {
    "Opened": emptyProps(),
    "Load": emptyProps(),
    "Load Success": props<{ overview: AdminOverview }>(),
    "Load Failure": props<{ error: string }>(),
  },
});
