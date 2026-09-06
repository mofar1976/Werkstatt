import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, debounceTime, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { WorkshopsService } from "./workshops.service";
import { WorkshopsActions } from "./workshops.actions";
import { selectWorkshopsQuery } from "./workshops.selectors";

const LIST_ERROR = "Werkstätten konnten nicht geladen werden";

export const searchLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(WorkshopsActions.searchChanged),
      debounceTime(300),
      map(() => WorkshopsActions.load()),
    ),
  { functional: true },
);

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        WorkshopsActions.opened,
        WorkshopsActions.nearChanged,
        WorkshopsActions.nearCleared,
      ),
      map(() => WorkshopsActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(WorkshopsService),
  ) =>
    actions$.pipe(
      ofType(WorkshopsActions.load),
      concatLatestFrom(() => store.select(selectWorkshopsQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((items) => WorkshopsActions.loadSuccess({ items })),
          catchError((e: unknown) =>
            of(
              WorkshopsActions.loadFailure({
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
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.loadDetail),
      switchMap(({ id }) =>
        api.getOne(id).pipe(
          map((workshop) => WorkshopsActions.loadDetailSuccess({ workshop })),
          catchError((e: unknown) =>
            of(
              WorkshopsActions.loadDetailFailure({
                error: apiErrorMessage(e, "Werkstatt konnte nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
