import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import {
  catchError,
  debounceTime,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from "rxjs";
import { apiErrorMessage } from "../../shared";
import { WorkshopsService } from "./workshops.service";
import { WorkshopsActions } from "./workshops.actions";
import { selectWorkshopQuery } from "./workshops.selectors";

const LIST_ERROR = "Werkstätten konnten nicht geladen werden";

// --- list ---
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
        WorkshopsActions.statusChanged,
        WorkshopsActions.pageChanged,
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
      concatLatestFrom(() => store.select(selectWorkshopQuery)),
      switchMap(([, query]) =>
        api.list(query).pipe(
          map((result) =>
            WorkshopsActions.loadSuccess({
              items: result.items,
              total: result.total,
            }),
          ),
          catchError((e: unknown) =>
            of(WorkshopsActions.loadFailure({ error: apiErrorMessage(e, LIST_ERROR) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- detail ---
export const loadDetail$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.loadDetail),
      switchMap(({ id }) =>
        forkJoin({
          workshop: api.getOne(id),
          members: api.listMembers(id),
        }).pipe(
          map(({ workshop, members }) =>
            WorkshopsActions.loadDetailSuccess({ workshop, members }),
          ),
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

// --- mutations ---
export const create$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.create),
      exhaustMap(({ input }) =>
        api.create(input).pipe(
          map((workshop) => WorkshopsActions.saveSuccess({ workshop })),
          catchError((e: unknown) =>
            of(WorkshopsActions.saveFailure({ error: apiErrorMessage(e, "Speichern fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const update$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.update),
      exhaustMap(({ id, input }) =>
        api.update(id, input).pipe(
          map((workshop) => WorkshopsActions.saveSuccess({ workshop })),
          catchError((e: unknown) =>
            of(WorkshopsActions.saveFailure({ error: apiErrorMessage(e, "Speichern fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const toggleStatus$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.toggleStatus),
      mergeMap(({ id, activate }) =>
        api.setStatus(id, activate).pipe(
          map((workshop) => WorkshopsActions.saveSuccess({ workshop })),
          catchError((e: unknown) =>
            of(WorkshopsActions.saveFailure({ error: apiErrorMessage(e, "Statuswechsel fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const delete$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.delete),
      exhaustMap(({ id }) =>
        api.remove(id).pipe(
          map(() => WorkshopsActions.deleteSuccess()),
          catchError((e: unknown) =>
            of(WorkshopsActions.saveFailure({ error: apiErrorMessage(e, "Löschen fehlgeschlagen") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- members ---
export const addMember$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.addMember),
      exhaustMap(({ workshopId, input }) =>
        api.addMember(workshopId, input).pipe(
          switchMap(() => api.listMembers(workshopId)),
          map((members) => WorkshopsActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(WorkshopsActions.memberSaveFailure({ error: apiErrorMessage(e, "Mitarbeiter konnte nicht angelegt werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateMemberRole$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.updateMemberRole),
      mergeMap(({ workshopId, memberId, role }) =>
        api.updateMemberRole(workshopId, memberId, role).pipe(
          switchMap(() => api.listMembers(workshopId)),
          map((members) => WorkshopsActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(WorkshopsActions.memberSaveFailure({ error: apiErrorMessage(e, "Rolle konnte nicht geändert werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const removeMember$ = createEffect(
  (actions$ = inject(Actions), api = inject(WorkshopsService)) =>
    actions$.pipe(
      ofType(WorkshopsActions.removeMember),
      mergeMap(({ workshopId, memberId }) =>
        api.removeMember(workshopId, memberId).pipe(
          switchMap(() => api.listMembers(workshopId)),
          map((members) => WorkshopsActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(WorkshopsActions.memberSaveFailure({ error: apiErrorMessage(e, "Mitarbeiter konnte nicht entfernt werden") })),
          ),
        ),
      ),
    ),
  { functional: true },
);

// --- navigation & list refresh ---
export const navigateAfterSave$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(WorkshopsActions.saveSuccess),
      tap(({ workshop }) => void router.navigate(["/workshops", workshop.id])),
    ),
  { functional: true, dispatch: false },
);

export const navigateAfterDelete$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(WorkshopsActions.deleteSuccess),
      tap(() => void router.navigate(["/workshops"])),
    ),
  { functional: true, dispatch: false },
);

export const refreshListAfterMutation$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(WorkshopsActions.saveSuccess, WorkshopsActions.deleteSuccess),
      map(() => WorkshopsActions.load()),
    ),
  { functional: true },
);
