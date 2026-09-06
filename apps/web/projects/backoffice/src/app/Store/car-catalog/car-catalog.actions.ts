import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { CarBrand, CarModel } from "@car-garage/shared";

export const CarCatalogActions = createActionGroup({
  source: "Car Catalog",
  events: {
    // --- brand list ---
    "Opened": emptyProps(),
    "Search Changed": props<{ search: string }>(),
    "Page Changed": props<{ page: number }>(),
    "Load": emptyProps(),
    "Load Success": props<{ items: CarBrand[]; total: number }>(),
    "Load Failure": props<{ error: string }>(),

    // --- brand detail ---
    "Load Brand": props<{ id: string }>(),
    "Load Brand Success": props<{ brand: CarBrand; models: CarModel[] }>(),
    "Load Brand Failure": props<{ error: string }>(),
    "Leave Brand": emptyProps(),

    // --- brand mutations ---
    "Create Brand": props<{ name: string }>(),
    "Update Brand": props<{ id: string; name: string }>(),
    "Brand Saved": props<{ brand: CarBrand }>(),
    "Brand Save Failure": props<{ error: string }>(),
    "Delete Brand": props<{ id: string }>(),
    "Brand Deleted": emptyProps(),

    // --- logo ---
    "Upload Logo": props<{ brandId: string; file: File }>(),
    "Remove Logo": props<{ brandId: string }>(),

    // --- models ---
    "Create Model": props<{ brandId: string; name: string }>(),
    "Update Model": props<{ brandId: string; modelId: string; name: string }>(),
    "Delete Model": props<{ brandId: string; modelId: string }>(),
    "Models Changed": props<{ models: CarModel[] }>(),
    "Model Save Failure": props<{ error: string }>(),
  },
});
