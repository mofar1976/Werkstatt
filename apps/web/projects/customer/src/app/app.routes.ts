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
        path: "workshops",
        loadChildren: () =>
          import("./features/workshops/workshops.routes").then(
            (m) => m.workshopsRoutes,
          ),
      },
      {
        path: "book",
        loadChildren: () =>
          import("./features/booking/booking.routes").then(
            (m) => m.bookingRoutes,
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
        path: "repairs",
        loadChildren: () =>
          import("./features/repairs/repairs.routes").then(
            (m) => m.repairsRoutes,
          ),
      },
    ],
  },

  { path: "**", redirectTo: "" },
];
