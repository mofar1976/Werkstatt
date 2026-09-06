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
            (m) => m.workshopRoutes,
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
      {
        path: "car-catalog",
        loadChildren: () =>
          import("./features/car-catalog/car-catalog.routes").then(
            (m) => m.carCatalogRoutes,
          ),
      },
      {
        path: "customers",
        loadChildren: () =>
          import("./features/customers/customers.routes").then(
            (m) => m.customersRoutes,
          ),
      },
    ],
  },

  { path: "**", redirectTo: "" },
];
