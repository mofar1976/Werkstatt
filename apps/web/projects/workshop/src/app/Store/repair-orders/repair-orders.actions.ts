import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type {
  Appointment,
  RepairAssignee,
  RepairOrder,
  RepairOrderDetail,
} from "@car-garage/shared";
import type { DiagnosisInput, RepairStatusFilter } from "./repair-orders.state";

export const RepairOrdersActions = createActionGroup({
  source: "Repair Orders",
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
    "Load Team Success": props<{ members: RepairAssignee[] }>(),

    // --- create from appointment ---
    "Load Candidates": emptyProps(),
    "Load Candidates Success": props<{ candidates: Appointment[] }>(),
    "Load Candidates Failure": props<{ error: string }>(),
    "Create": props<{ appointmentId: string }>(),
    "Created": props<{ order: RepairOrderDetail }>(),

    // --- mutations ---
    "Save Diagnosis": props<{ id: string; input: DiagnosisInput }>(),
    "Set Assignees": props<{ id: string; memberIds: string[] }>(),
    "Send Quote": props<{ id: string }>(),
    "Advance Status": props<{ id: string; status: string; note?: string }>(),
    "Add Note": props<{ id: string; message: string }>(),
    "Cancel": props<{ id: string; reason?: string }>(),
    "Save Success": props<{ order: RepairOrderDetail }>(),
    "Save Failure": props<{ error: string }>(),
  },
});
