import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { AppointmentsService } from "./appointments.service";
import { AppointmentsActions } from "./appointments.actions";
import { selectAppointmentsQuery } from "./appointments.selectors";

const LIST_ERROR = "Termine konnten nicht geladen werden";

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
