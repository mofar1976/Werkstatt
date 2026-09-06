import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  CUSTOMERS_FEATURE_KEY,
  customersEffects,
  customersReducer,
} from "../../Store/customers";
import { CustomerListComponent } from "./list/list.component";
import { CustomerDetailComponent } from "./detail/detail.component";

export const customersRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(CUSTOMERS_FEATURE_KEY, customersReducer),
      provideEffects(customersEffects),
    ],
    children: [
      { path: "", component: CustomerListComponent, title: "Nutzer" },
      { path: ":id", component: CustomerDetailComponent, title: "Nutzer" },
    ],
  },
];
