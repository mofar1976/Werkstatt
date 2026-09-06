import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import {
  catchError,
  debounceTime,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from "rxjs";
import { apiErrorMessage } from "../../shared";
import { CarCatalogService } from "./car-catalog.service";
import { CarCatalogActions } from "./car-catalog.actions";
import { selectBrandQuery } from "./car-catalog.selectors";

// --- list ---
export const searchLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CarCatalogActions.searchChanged),
      debounceTime(300),
      map(() => CarCatalogActions.load()),
    ),
  { functional: true },
);

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CarCatalogActions.opened, CarCatalogActions.pageChanged),
      map(() => CarCatalogActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(CarCatalogService),
  ) =>
    actions$.pipe(
      ofType(CarCatalogActions.load),
      concatLatestFrom(() => store.select(selectBrandQuery)),
      switchMap(([, query]) =>
        api.listBrands(query).pipe(
          map((r) =>
            CarCatalogActions.loadSuccess({ items: r.items, total: r.total }),
          ),
          catchError((e: unknown) =>
            of(
              CarCatalogActions.loadFailure({
                error: apiErrorMessage(e, "Marken konnten nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- detail ---
export const loadBrand$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.loadBrand),
      switchMap(({ id }) =>
        forkJoin({
          brand: api.getBrand(id),
          models: api.listModels(id),
        }).pipe(
          map(({ brand, models }) =>
            CarCatalogActions.loadBrandSuccess({ brand, models }),
          ),
          catchError((e: unknown) =>
            of(
              CarCatalogActions.loadBrandFailure({
                error: apiErrorMessage(e, "Marke konnte nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- brand mutations ---
export const createBrand$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.createBrand),
      exhaustMap(({ name }) =>
        api.createBrand(name).pipe(
          map((brand) => CarCatalogActions.brandSaved({ brand })),
          catchError((e: unknown) =>
            of(CarCatalogActions.brandSaveFailure({ error: apiErrorMessage(e, "Speichern fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateBrand$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.updateBrand),
      exhaustMap(({ id, name }) =>
        api.updateBrand(id, name).pipe(
          map((brand) => CarCatalogActions.brandSaved({ brand })),
          catchError((e: unknown) =>
            of(CarCatalogActions.brandSaveFailure({ error: apiErrorMessage(e, "Speichern fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const deleteBrand$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.deleteBrand),
      exhaustMap(({ id }) =>
        api.deleteBrand(id).pipe(
          map(() => CarCatalogActions.brandDeleted()),
          catchError((e: unknown) =>
            of(CarCatalogActions.brandSaveFailure({ error: apiErrorMessage(e, "Löschen fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- logo ---
export const uploadLogo$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.uploadLogo),
      exhaustMap(({ brandId, file }) =>
        api.uploadLogo(brandId, file).pipe(
          map((brand) => CarCatalogActions.brandSaved({ brand })),
          catchError((e: unknown) =>
            of(CarCatalogActions.brandSaveFailure({ error: apiErrorMessage(e, "Logo-Upload fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const removeLogo$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.removeLogo),
      exhaustMap(({ brandId }) =>
        api.removeLogo(brandId).pipe(
          map((brand) => CarCatalogActions.brandSaved({ brand })),
          catchError((e: unknown) =>
            of(CarCatalogActions.brandSaveFailure({ error: apiErrorMessage(e, "Logo konnte nicht entfernt werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- models ---
function reloadModels(api: CarCatalogService, brandId: string) {
  return api
    .listModels(brandId)
    .pipe(map((models) => CarCatalogActions.modelsChanged({ models })));
}

export const createModel$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.createModel),
      exhaustMap(({ brandId, name }) =>
        api.createModel(brandId, name).pipe(
          switchMap(() => reloadModels(api, brandId)),
          catchError((e: unknown) =>
            of(CarCatalogActions.modelSaveFailure({ error: apiErrorMessage(e, "Modell konnte nicht angelegt werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateModel$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.updateModel),
      mergeMap(({ brandId, modelId, name }) =>
        api.updateModel(brandId, modelId, name).pipe(
          switchMap(() => reloadModels(api, brandId)),
          catchError((e: unknown) =>
            of(CarCatalogActions.modelSaveFailure({ error: apiErrorMessage(e, "Modell konnte nicht geändert werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const deleteModel$ = createEffect(
  (actions$ = inject(Actions), api = inject(CarCatalogService)) =>
    actions$.pipe(
      ofType(CarCatalogActions.deleteModel),
      mergeMap(({ brandId, modelId }) =>
        api.deleteModel(brandId, modelId).pipe(
          switchMap(() => reloadModels(api, brandId)),
          catchError((e: unknown) =>
            of(CarCatalogActions.modelSaveFailure({ error: apiErrorMessage(e, "Modell konnte nicht gelöscht werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- navigation & list refresh ---
export const navigateAfterSave$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(CarCatalogActions.brandSaved),
      tap(({ brand }) => void router.navigate(["/car-catalog", brand.id])),
    ),
  { functional: true, dispatch: false },
);

export const navigateAfterDelete$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(CarCatalogActions.brandDeleted),
      tap(() => void router.navigate(["/car-catalog"])),
    ),
  { functional: true, dispatch: false },
);

export const refreshList$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CarCatalogActions.brandSaved, CarCatalogActions.brandDeleted),
      map(() => CarCatalogActions.load()),
    ),
  { functional: true },
);
