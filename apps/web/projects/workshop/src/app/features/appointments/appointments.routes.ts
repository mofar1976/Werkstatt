import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  APPOINTMENTS_FEATURE_KEY,
  appointmentsEffects,
  appointmentsReducer,
} from "../../Store/appointments";
import { AppointmentListComponent } from "./list/list.component";
import { AppointmentDetailComponent } from "./detail/detail.component";

export const appointmentsRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(APPOINTMENTS_FEATURE_KEY, appointmentsReducer),
      provideEffects(appointmentsEffects),
    ],
    children: [
      { path: "", component: AppointmentListComponent, title: "Termine" },
      { path: ":id", component: AppointmentDetailComponent, title: "Termin" },
    ],
  },
];
