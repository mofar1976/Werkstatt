import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, map, merge, of, switchMap, tap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { RepairOrdersService } from "./repair-orders.service";
import { RepairOrdersActions } from "./repair-orders.actions";
import { selectRepairOrderQuery } from "./repair-orders.selectors";

const LIST_ERROR = "Reparaturaufträge konnten nicht geladen werden";

// --- list ---
export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(
        RepairOrdersActions.opened,
        RepairOrdersActions.statusChanged,
        RepairOrdersActions.pageChanged,
      ),
      map(() => RepairOrdersActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(RepairOrdersService),
  ) =>
    actions$.pipe(
      ofType(RepairOrdersActions.load),
      concatLatestFrom(() => store.select(selectRepairOrderQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((r) =>
            RepairOrdersActions.loadSuccess({ items: r.items, total: r.total }),
          ),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.loadFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- detail (order + team members in parallel) ---
export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.loadDetail),
      switchMap(({ id }) =>
        merge(
          api.getOne(id).pipe(
            map((order) => RepairOrdersActions.loadDetailSuccess({ order })),
            catchError((e: unknown) =>
              of(
                RepairOrdersActions.loadDetailFailure({
                  error: apiErrorMessage(
                    e,
                    "Reparaturauftrag konnte nicht geladen werden",
                  ),
                }),
              ),
            ),
          ),
          api.listTeamMembers().pipe(
            map((members) => RepairOrdersActions.loadTeamSuccess({ members })),
            catchError(() =>
              of(RepairOrdersActions.loadTeamSuccess({ members: [] })),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- new-order candidates ---
export const loadCandidates$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.loadCandidates),
      switchMap(() =>
        api.listCandidates().pipe(
          map((candidates) =>
            RepairOrdersActions.loadCandidatesSuccess({ candidates }),
          ),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.loadCandidatesFailure({
                error: apiErrorMessage(e, "Termine konnten nicht geladen werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- create from appointment ---
export const create$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.create),
      exhaustMap(({ appointmentId }) =>
        api.create(appointmentId).pipe(
          map((order) => RepairOrdersActions.created({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(
                  e,
                  "Auftrag konnte nicht angelegt werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const navigateAfterCreate$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.created),
      tap(({ order }) => void router.navigate(["/repair-orders", order.id])),
    ),
  { functional: true, dispatch: false },
);

// --- mutations ---
export const saveDiagnosis$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.saveDiagnosis),
      exhaustMap(({ id, input }) =>
        api.saveDiagnosis(id, input).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Diagnose konnte nicht gespeichert werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const setAssignees$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.setAssignees),
      exhaustMap(({ id, memberIds }) =>
        api.setAssignees(id, memberIds).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Zuweisung fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const sendQuote$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.sendQuote),
      exhaustMap(({ id }) =>
        api.sendQuote(id).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Angebot konnte nicht gesendet werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const advanceStatus$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.advanceStatus),
      exhaustMap(({ id, status, note }) =>
        api.advanceStatus(id, status, note).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Statuswechsel fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const addNote$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.addNote),
      exhaustMap(({ id, message }) =>
        api.addNote(id, message).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Notiz konnte nicht gespeichert werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const cancel$ = createEffect(
  (actions$ = inject(Actions), api = inject(RepairOrdersService)) =>
    actions$.pipe(
      ofType(RepairOrdersActions.cancel),
      exhaustMap(({ id, reason }) =>
        api.cancel(id, reason).pipe(
          map((order) => RepairOrdersActions.saveSuccess({ order })),
          catchError((e: unknown) =>
            of(
              RepairOrdersActions.saveFailure({
                error: apiErrorMessage(e, "Auftrag konnte nicht abgebrochen werden"),
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
      ofType(RepairOrdersActions.saveSuccess),
      map(() => RepairOrdersActions.load()),
    ),
  { functional: true },
);
