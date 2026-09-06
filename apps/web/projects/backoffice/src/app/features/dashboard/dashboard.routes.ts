import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  DASHBOARD_FEATURE_KEY,
  dashboardEffects,
  dashboardReducer,
} from "../../Store/dashboard";
import { DashboardComponent } from "./dashboard.component";

export const dashboardRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(DASHBOARD_FEATURE_KEY, dashboardReducer),
      provideEffects(dashboardEffects),
    ],
    children: [
      { path: "", component: DashboardComponent, title: "Übersicht" },
    ],
  },
];
