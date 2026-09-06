import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import {
  catchError,
  debounceTime,
  exhaustMap,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from "rxjs";
import { apiErrorMessage } from "../../shared";
import { CustomersService } from "./customers.service";
import { CustomersActions } from "./customers.actions";
import { selectCustomerQuery } from "./customers.selectors";

const LIST_ERROR = "Nutzer konnten nicht geladen werden";

// --- list ---
export const searchLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CustomersActions.searchChanged),
      debounceTime(300),
      map(() => CustomersActions.load()),
    ),
  { functional: true },
);

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        CustomersActions.opened,
        CustomersActions.statusChanged,
        CustomersActions.pageChanged,
      ),
      map(() => CustomersActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(CustomersService),
  ) =>
    actions$.pipe(
      ofType(CustomersActions.load),
      concatLatestFrom(() => store.select(selectCustomerQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((result) =>
            CustomersActions.loadSuccess({
              items: result.items,
              total: result.total,
            }),
          ),
          catchError((e: unknown) =>
            of(
              CustomersActions.loadFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- detail ---
export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(CustomersService)) =>
    actions$.pipe(
      ofType(CustomersActions.loadDetail),
      switchMap(({ id }) =>
        api.getOne(id).pipe(
          map((customer) => CustomersActions.loadDetailSuccess({ customer })),
          catchError((e: unknown) =>
            of(
              CustomersActions.loadDetailFailure({
                error: apiErrorMessage(e, "Nutzer konnte nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- mutations ---
export const update$ = createEffect(
  (actions$ = inject(Actions), api = inject(CustomersService)) =>
    actions$.pipe(
      ofType(CustomersActions.update),
      exhaustMap(({ id, input }) =>
        api.update(id, input).pipe(
          map((customer) => CustomersActions.saveSuccess({ customer })),
          catchError((e: unknown) =>
            of(
              CustomersActions.saveFailure({
                error: apiErrorMessage(e, "Speichern fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const setBlocked$ = createEffect(
  (actions$ = inject(Actions), api = inject(CustomersService)) =>
    actions$.pipe(
      ofType(CustomersActions.setBlocked),
      mergeMap(({ id, blocked }) =>
        api.setBlocked(id, blocked).pipe(
          map((customer) => CustomersActions.saveSuccess({ customer })),
          catchError((e: unknown) =>
            of(
              CustomersActions.saveFailure({
                error: apiErrorMessage(e, "Sperrstatus konnte nicht geändert werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const delete$ = createEffect(
  (actions$ = inject(Actions), api = inject(CustomersService)) =>
    actions$.pipe(
      ofType(CustomersActions.delete),
      exhaustMap(({ id }) =>
        api.remove(id).pipe(
          map(() => CustomersActions.deleteSuccess()),
          catchError((e: unknown) =>
            of(
              CustomersActions.saveFailure({
                error: apiErrorMessage(e, "Löschen fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- navigation & list refresh ---
export const navigateAfterDelete$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(CustomersActions.deleteSuccess),
      tap(() => void router.navigate(["/customers"])),
    ),
  { functional: true, dispatch: false },
);

export const refreshListAfterMutation$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(CustomersActions.saveSuccess, CustomersActions.deleteSuccess),
      map(() => CustomersActions.load()),
    ),
  { functional: true },
);
