import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { TEAM_FEATURE_KEY, teamEffects, teamReducer } from "../../Store/team";
import { TeamComponent } from "./team.component";

export const teamRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(TEAM_FEATURE_KEY, teamReducer),
      provideEffects(teamEffects),
    ],
    children: [{ path: "", component: TeamComponent, title: "Team" }],
  },
];
