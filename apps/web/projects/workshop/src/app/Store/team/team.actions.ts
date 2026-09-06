import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { WorkshopMember } from "@car-garage/shared";
import type { AddMemberInput, UpdateMemberInput } from "./team.state";

export const TeamActions = createActionGroup({
  source: "Team",
  events: {
    "Opened": emptyProps(),
    "Load": emptyProps(),
    "Load Success": props<{ members: WorkshopMember[] }>(),
    "Load Failure": props<{ error: string }>(),
    "Leave": emptyProps(),

    "Add Member": props<{ input: AddMemberInput }>(),
    "Update Member": props<{ memberId: string; input: UpdateMemberInput }>(),
    "Remove Member": props<{ memberId: string }>(),
    "Members Changed": props<{ members: WorkshopMember[] }>(),
    "Member Save Failure": props<{ error: string }>(),
  },
});
