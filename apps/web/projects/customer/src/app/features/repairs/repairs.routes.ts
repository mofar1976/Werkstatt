import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  REPAIRS_FEATURE_KEY,
  repairsEffects,
  repairsReducer,
} from "../../Store/repairs";
import { RepairListComponent } from "./list/list.component";
import { RepairDetailComponent } from "./detail/detail.component";

export const repairsRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(REPAIRS_FEATURE_KEY, repairsReducer),
      provideEffects(repairsEffects),
    ],
    children: [
      { path: "", component: RepairListComponent, title: "Reparaturen" },
      { path: ":id", component: RepairDetailComponent, title: "Reparatur" },
    ],
  },
];
