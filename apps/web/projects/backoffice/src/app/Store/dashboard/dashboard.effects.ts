import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { DashboardService } from "./dashboard.service";
import { DashboardActions } from "./dashboard.actions";

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(DashboardActions.opened),
      map(() => DashboardActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(DashboardService)) =>
    actions$.pipe(
      ofType(DashboardActions.load),
      switchMap(() =>
        api.overview().pipe(
          map((overview) => DashboardActions.loadSuccess({ overview })),
          catchError((e: unknown) =>
            of(
              DashboardActions.loadFailure({
                error: apiErrorMessage(
                  e,
                  "Übersicht konnte nicht geladen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
