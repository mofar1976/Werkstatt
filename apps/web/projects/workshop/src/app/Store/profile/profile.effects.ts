import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { ProfileService } from "./profile.service";
import { ProfileActions } from "./profile.actions";

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(ProfileActions.opened),
      map(() => ProfileActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(ProfileService)) =>
    actions$.pipe(
      ofType(ProfileActions.load),
      switchMap(() =>
        api.getMyWorkshop().pipe(
          map((workshop) => ProfileActions.loadSuccess({ workshop })),
          catchError((e: unknown) =>
            of(
              ProfileActions.loadFailure({
                error: apiErrorMessage(
                  e,
                  "Werkstattprofil konnte nicht geladen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const save$ = createEffect(
  (actions$ = inject(Actions), api = inject(ProfileService)) =>
    actions$.pipe(
      ofType(ProfileActions.save),
      exhaustMap(({ input }) =>
        api.updateMyWorkshop(input).pipe(
          map((workshop) => ProfileActions.saveSuccess({ workshop })),
          catchError((e: unknown) =>
            of(
              ProfileActions.saveFailure({
                error: apiErrorMessage(e, "Speichern fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
