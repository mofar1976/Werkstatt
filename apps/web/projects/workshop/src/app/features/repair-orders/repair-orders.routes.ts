import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  REPAIR_ORDERS_FEATURE_KEY,
  repairOrdersEffects,
  repairOrdersReducer,
} from "../../Store/repair-orders";
import { RepairOrderListComponent } from "./list/list.component";
import { RepairOrderDetailComponent } from "./detail/detail.component";

export const repairOrdersRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(REPAIR_ORDERS_FEATURE_KEY, repairOrdersReducer),
      provideEffects(repairOrdersEffects),
    ],
    children: [
      { path: "", component: RepairOrderListComponent, title: "Reparaturen" },
      {
        path: ":id",
        component: RepairOrderDetailComponent,
        title: "Reparaturauftrag",
      },
    ],
  },
];
