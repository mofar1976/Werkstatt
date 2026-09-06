import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { AdminCustomer } from "@car-garage/shared";
import type { CustomerInput, CustomerStatusFilter } from "./customers.state";

export const CustomersActions = createActionGroup({
  source: "Customers",
  events: {
    // --- list ---
    "Opened": emptyProps(),
    "Search Changed": props<{ search: string }>(),
    "Status Changed": props<{ status: CustomerStatusFilter }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: AdminCustomer[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- detail ---
    "Load Detail": props<{ id: string }>(),
    "Load Detail Success": props<{ customer: AdminCustomer }>(),
    "Load Detail Failure": props<{ error: string }>(),
    "Leave Detail": emptyProps(),

    // --- mutations ---
    "Update": props<{ id: string; input: CustomerInput }>(),
    "Set Blocked": props<{ id: string; blocked: boolean }>(),
    "Delete": props<{ id: string }>(),
    "Save Success": props<{ customer: AdminCustomer }>(),
    "Save Failure": props<{ error: string }>(),
    "Delete Success": emptyProps(),
  },
});
