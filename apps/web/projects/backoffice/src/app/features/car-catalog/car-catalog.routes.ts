import type { Routes } from "@angular/router";
import { provideState } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import {
  CAR_CATALOG_FEATURE_KEY,
  carCatalogEffects,
  carCatalogReducer,
} from "../../Store/car-catalog";
import { BrandListComponent } from "./list/list.component";
import { BrandFormComponent } from "./form/form.component";
import { BrandDetailComponent } from "./detail/detail.component";

export const carCatalogRoutes: Routes = [
  {
    path: "",
    providers: [
      provideState(CAR_CATALOG_FEATURE_KEY, carCatalogReducer),
      provideEffects(carCatalogEffects),
    ],
    children: [
      { path: "", component: BrandListComponent, title: "Marken & Modelle" },
      { path: "new", component: BrandFormComponent, title: "Neue Marke" },
      { path: ":brandId", component: BrandDetailComponent, title: "Marke" },
      {
        path: ":brandId/edit",
        component: BrandFormComponent,
        title: "Marke bearbeiten",
      },
    ],
  },
];
