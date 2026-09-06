import type { Routes } from "@angular/router";
import { authGuard } from "./core/guards";
import { LayoutComponent } from "./layout";
import { authRoutes } from "./features/auth/auth.routes";

export const routes: Routes = [
  ...authRoutes,

  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/dashboard/dashboard.routes").then(
            (m) => m.dashboardRoutes,
          ),
      },
      {
        path: "appointments",
        loadChildren: () =>
          import("./features/appointments/appointments.routes").then(
            (m) => m.appointmentsRoutes,
          ),
      },
      {
        path: "repair-orders",
        loadChildren: () =>
          import("./features/repair-orders/repair-orders.routes").then(
            (m) => m.repairOrdersRoutes,
          ),
      },
      {
        path: "availability",
        loadChildren: () =>
          import("./features/availability/availability.routes").then(
            (m) => m.availabilityRoutes,
          ),
      },
      {
        path: "team",
        loadChildren: () =>
          import("./features/team/team.routes").then((m) => m.teamRoutes),
      },
      {
        path: "workshop",
        loadChildren: () =>
          import("./features/workshop/workshop.routes").then(
            (m) => m.workshopRoutes,
          ),
      },
    ],
  },

  { path: "**", redirectTo: "" },
];
