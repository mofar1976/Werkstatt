import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { RepairOrder } from "@car-garage/shared";
import type { RepairStatusFilter } from "./repairs.state";

export const RepairsActions = createActionGroup({
  source: "Admin Repairs",
  events: {
    "Opened": emptyProps(),
    "Status Changed": props<{ status: RepairStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: RepairOrder[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),
  },
});
