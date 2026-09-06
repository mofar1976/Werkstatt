import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { RepairsService } from "./repairs.service";
import { RepairsActions } from "./repairs.actions";
import { selectRepairsQuery } from "./repairs.selectors";

const LIST_ERROR = "Reparaturen konnten nicht geladen werden";

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        RepairsActions.opened,
        RepairsActions.statusChanged,
        RepairsActions.pageChanged,
      ),
      map(() => RepairsActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(RepairsService),
  ) =>
    actions$.pipe(
      ofType(RepairsActions.load),
      concatLatestFrom(() => store.select(selectRepairsQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((r) =>
            RepairsActions.loadSuccess({ items: r.items, total: r.total }),
          ),
          catchError((e: unknown) =>
            of(
              RepairsActions.loadFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
