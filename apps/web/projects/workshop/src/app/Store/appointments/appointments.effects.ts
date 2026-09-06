import { inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsActions } from "./appointments.actions";
import {
  selectAppointmentQuery,
  selectCalendarMonth,
} from "./appointments.selectors";

/** `YYYY-MM` -> [firstDay 00:00, lastDay 23:59:59] as ISO strings (local). */
function monthRange(month: string): { from: string; to: string } {
  const [year, m] = month.split("-").map(Number);
  return {
    from: new Date(year, m - 1, 1, 0, 0, 0, 0).toISOString(),
    to: new Date(year, m, 0, 23, 59, 59, 999).toISOString(),
  };
}

const LIST_ERROR = "Termine konnten nicht geladen werden";

/** The API rejects a mutation on a non-CONFIRMED appointment with 409. */
function mutationError(e: unknown, fallback: string): string {
  if (e instanceof HttpErrorResponse && e.status === 409) {
    return "Dieser Termin kann nicht mehr geändert werden.";
  }
  return apiErrorMessage(e, fallback);
}

// --- list ---
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
      concatLatestFrom(() => store.select(selectAppointmentQuery)),
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

// --- calendar ---
export const triggerCalendarLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        AppointmentsActions.calendarOpened,
        AppointmentsActions.calendarMonthChanged,
      ),
      map(() => AppointmentsActions.loadCalendar()),
    ),
  { functional: true },
);

export const loadCalendar$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(AppointmentsService),
  ) =>
    actions$.pipe(
      ofType(AppointmentsActions.loadCalendar),
      concatLatestFrom(() => store.select(selectCalendarMonth)),
      switchMap(([, month]) => {
        const { from, to } = monthRange(month);
        return api.listRange(from, to).pipe(
          map((items) => AppointmentsActions.loadCalendarSuccess({ items })),
          catchError((e: unknown) =>
            of(
              AppointmentsActions.loadCalendarFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        );
      }),
    ),
  { functional: true },
);

// --- detail ---
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
                error: apiErrorMessage(e, "Termin konnte nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- mutations ---
export const cancel$ = createEffect(
  (actions$ = inject(Actions), api = inject(AppointmentsService)) =>
    actions$.pipe(
      ofType(AppointmentsActions.cancel),
      exhaustMap(({ id, reason }) =>
        api.cancel(id, reason).pipe(
          map((appointment) => AppointmentsActions.saveSuccess({ appointment })),
          catchError((e: unknown) =>
            of(
              AppointmentsActions.saveFailure({
                error: mutationError(e, "Termin konnte nicht storniert werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const complete$ = createEffect(
  (actions$ = inject(Actions), api = inject(AppointmentsService)) =>
    actions$.pipe(
      ofType(AppointmentsActions.complete),
      exhaustMap(({ id }) =>
        api.complete(id).pipe(
          map((appointment) => AppointmentsActions.saveSuccess({ appointment })),
          catchError((e: unknown) =>
            of(
              AppointmentsActions.saveFailure({
                error: mutationError(
                  e,
                  "Termin konnte nicht abgeschlossen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const refreshListAfterMutation$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AppointmentsActions.saveSuccess),
      map(() => AppointmentsActions.load()),
    ),
  { functional: true },
);

export const refreshCalendarAfterMutation$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AppointmentsActions.saveSuccess),
      map(() => AppointmentsActions.loadCalendar()),
    ),
  { functional: true },
);
