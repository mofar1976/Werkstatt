import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { RepairOrder, RepairOrderDetail } from "@car-garage/shared";
import type { RepairStatusFilter } from "./repairs.state";

export const RepairsActions = createActionGroup({
  source: "Customer Repairs",
  events: {
    // --- list ---
    "Opened": emptyProps(),
    "Status Changed": props<{ status: RepairStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: RepairOrder[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- detail ---
    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{ order: RepairOrderDetail }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),

    // --- quote decision ---
    "Approve Quote": props<{ id: string }>(),
    "Reject Quote": props<{ id: string; reason?: string }>(),
    "Decision Success": props<{ order: RepairOrderDetail }>(),
    "Decision Failure": props<{ error: string }>(),
  },
});
