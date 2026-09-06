import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type {
  Workshop,
  WorkshopMember,
  WorkshopRole,
  WorkshopStatus,
} from "@car-garage/shared";
import type { AddMemberInput, WorkshopInput } from "./workshops.state";

export const WorkshopsActions = createActionGroup({
  source: "Workshops",
  events: {
    // --- list ---
    "Opened": emptyProps(),
    "Search Changed": props<{ search: string }>(),
    "Status Changed": props<{ status: WorkshopStatus | "" }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: Workshop[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- detail ---
    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{
      workshop: Workshop;
      members: WorkshopMember[];
    }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),

    // --- mutations ---
    "Create": props<{ input: WorkshopInput }>(),
    "Update": props<{ id: string; input: WorkshopInput }>(),
    "Save Success": props<{ workshop: Workshop }>(),
    "Save Failure": props<{ error: string }>(),

    "Toggle Status": props<{ id: string; activate: boolean }>(),
    "Delete": props<{ id: string }>(),
    "Delete Success": emptyProps(),

    "Add Member": props<{ workshopId: string; input: AddMemberInput }>(),
    "Update Member Role": props<{
      workshopId: string;
      memberId: string;
      role: WorkshopRole;
    }>(),
    "Remove Member": props<{ workshopId: string; memberId: string }>(),
    "Members Changed": props<{ members: WorkshopMember[] }>(),
    "Member Save Failure": props<{ error: string }>(),
  },
});
