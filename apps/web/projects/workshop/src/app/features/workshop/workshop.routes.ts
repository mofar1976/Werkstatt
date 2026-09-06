import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  PROFILE_FEATURE_KEY,
  profileEffects,
  profileReducer,
} from "../../Store/profile";
import { WorkshopProfileComponent } from "./workshop.component";

export const workshopRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(PROFILE_FEATURE_KEY, profileReducer),
      provideEffects(profileEffects),
    ],
    children: [
      { path: "", component: WorkshopProfileComponent, title: "Werkstatt" },
    ],
  },
];
