import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  AVAILABILITY_FEATURE_KEY,
  availabilityEffects,
  availabilityReducer,
} from "../../Store/availability";
import { AvailabilityComponent } from "./availability.component";

export const availabilityRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(AVAILABILITY_FEATURE_KEY, availabilityReducer),
      provideEffects(availabilityEffects),
    ],
    children: [
      { path: "", component: AvailabilityComponent, title: "Verfügbarkeit" },
    ],
  },
];
