import { inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { RepairsService } from "./repairs.service";
import { RepairsActions } from "./repairs.actions";
import { selectRepairsQuery } from "./repairs.selectors";

const LIST_ERROR = "Reparaturen konnten nicht geladen werden";

/** The API returns 409 when the estimate is no longer awaiting a decision. */
function decisionError(e: unknown): string {
  if (e instanceof HttpErrorResponse && e.status === 409) {
    return "Für diesen Kostenvoranschlag ist keine Entscheidung mehr offen.";
  }
  return apiErrorMessage(e, "Die Entscheidung konnte nicht gespeichert werden");
}

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

export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairsService)) =>
    actions$.pipe(
      ofType(RepairsActions.loadDetail),
      switchMap(({ id }) =>
        api.getOne(id).pipe(
          map((order) => RepairsActions.loadDetailSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairsActions.loadDetailFailure({
                error: apiErrorMessage(
                  e,
                  "Reparatur konnte nicht geladen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const approve$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairsService)) =>
    actions$.pipe(
      ofType(RepairsActions.approveQuote),
      exhaustMap(({ id }) =>
        api.approve(id).pipe(
          map((order) => RepairsActions.decisionSuccess({ order })),
          catchError((e: unknown) =>
            of(RepairsActions.decisionFailure({ error: decisionError(e) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const reject$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairsService)) =>
    actions$.pipe(
      ofType(RepairsActions.rejectQuote),
      exhaustMap(({ id, reason }) =>
        api.reject(id, reason).pipe(
          map((order) => RepairsActions.decisionSuccess({ order })),
          catchError((e: unknown) =>
            of(RepairsActions.decisionFailure({ error: decisionError(e) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const refreshAfterDecision$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(RepairsActions.decisionSuccess),
      map(() => RepairsActions.load()),
    ),
  { functional: true },
);
