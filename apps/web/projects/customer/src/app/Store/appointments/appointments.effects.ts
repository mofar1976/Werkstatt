import { inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsActions } from "./appointments.actions";
import { selectAppointmentsQuery } from "./appointments.selectors";

const LIST_ERROR = "Termine konnten nicht geladen werden";

/** The API rejects cancelling a non-CONFIRMED appointment with 409. */
function cancelError(e: unknown): string {
  if (e instanceof HttpErrorResponse && e.status === 409) {
    return "Dieser Termin kann nicht mehr storniert werden.";
  }
  return apiErrorMessage(e, "Termin konnte nicht storniert werden");
}

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        AppointmentsActions.opened,
        AppointmentsActions.statusChanged,
        AppointmentsActions.pageChanged,
      ),
      map(() => AppointmentsActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(AppointmentsService),
  ) =>
    actions$.pipe(
      ofType(AppointmentsActions.load),
      concatLatestFrom(() => store.select(selectAppointmentsQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((r) =>
            AppointmentsActions.loadSuccess({ items: r.items, total: r.total }),
          ),
          catchError((e: unknown) =>
            of(
              AppointmentsActions.loadFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(AppointmentsService)) =>
    actions$.pipe(
      ofType(AppointmentsActions.loadDetail),
      switchMap(({ id }) =>
        api.getOne(id).pipe(
          map((appointment) =>
            AppointmentsActions.loadDetailSuccess({ appointment }),
          ),
          catchError((e: unknown) =>
            of(
              AppointmentsActions.loadDetailFailure({
                error: apiErrorMessage(
                  e,
                  "Termin konnte nicht geladen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const cancel$ = createEffect(
  (actions$ = inject(Actions), api = inject(AppointmentsService)) =>
    actions$.pipe(
      ofType(AppointmentsActions.cancel),
      exhaustMap(({ id, reason }) =>
        api.cancel(id, reason).pipe(
          map((appointment) =>
            AppointmentsActions.cancelSuccess({ appointment }),
          ),
          catchError((e: unknown) =>
            of(AppointmentsActions.cancelFailure({ error: cancelError(e) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const refreshAfterCancel$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AppointmentsActions.cancelSuccess),
      map(() => AppointmentsActions.load()),
    ),
  { functional: true },
);
