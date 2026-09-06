import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  WORKSHOPS_FEATURE_KEY,
  workshopsEffects,
  workshopsReducer,
} from "../../Store/workshops";
import { WorkshopListPageComponent } from "./list/list.component";
import { WorkshopDetailComponent } from "./detail/detail.component";

export const workshopsRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(WORKSHOPS_FEATURE_KEY, workshopsReducer),
      provideEffects(workshopsEffects),
    ],
    children: [
      {
        path: "",
        component: WorkshopListPageComponent,
        title: "Werkstatt finden",
      },
      {
        path: ":id",
        component: WorkshopDetailComponent,
        title: "Werkstatt",
      },
    ],
  },
];
