import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  WORKSHOPS_FEATURE_KEY,
  workshopsEffects,
  workshopsReducer,
} from "../../Store/workshops";
import { WorkshopListComponent } from "./list/list.component";
import { WorkshopFormComponent } from "./form/form.component";
import { WorkshopDetailComponent } from "./detail/detail.component";

export const workshopRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(WORKSHOPS_FEATURE_KEY, workshopsReducer),
      provideEffects(workshopsEffects),
    ],
    children: [
      { path: "", component: WorkshopListComponent, title: "Werkstätten" },
      { path: "new", component: WorkshopFormComponent, title: "Neue Werkstatt" },
      { path: ":id", component: WorkshopDetailComponent, title: "Werkstatt" },
      {
        path: ":id/edit",
        component: WorkshopFormComponent,
        title: "Werkstatt bearbeiten",
      },
    ],
  },
];
