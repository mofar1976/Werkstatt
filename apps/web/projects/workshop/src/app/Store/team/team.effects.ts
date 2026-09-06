import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, mergeMap, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { TeamService } from "./team.service";
import { TeamActions } from "./team.actions";

const LIST_ERROR = "Team konnte nicht geladen werden";

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(TeamActions.opened),
      map(() => TeamActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(TeamService)) =>
    actions$.pipe(
      ofType(TeamActions.load),
      switchMap(() =>
        api.listMembers().pipe(
          map((members) => TeamActions.loadSuccess({ members })),
          catchError((e: unknown) =>
            of(TeamActions.loadFailure({ error: apiErrorMessage(e, LIST_ERROR) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const addMember$ = createEffect(
  (actions$ = inject(Actions), api = inject(TeamService)) =>
    actions$.pipe(
      ofType(TeamActions.addMember),
      exhaustMap(({ input }) =>
        api.addMember(input).pipe(
          switchMap(() => api.listMembers()),
          map((members) => TeamActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(
              TeamActions.memberSaveFailure({
                error: apiErrorMessage(e, "Mitarbeiter konnte nicht angelegt werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const updateMember$ = createEffect(
  (actions$ = inject(Actions), api = inject(TeamService)) =>
    actions$.pipe(
      ofType(TeamActions.updateMember),
      mergeMap(({ memberId, input }) =>
        api.updateMember(memberId, input).pipe(
          switchMap(() => api.listMembers()),
          map((members) => TeamActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(
              TeamActions.memberSaveFailure({
                error: apiErrorMessage(e, "Änderung konnte nicht gespeichert werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const removeMember$ = createEffect(
  (actions$ = inject(Actions), api = inject(TeamService)) =>
    actions$.pipe(
      ofType(TeamActions.removeMember),
      mergeMap(({ memberId }) =>
        api.removeMember(memberId).pipe(
          switchMap(() => api.listMembers()),
          map((members) => TeamActions.membersChanged({ members })),
          catchError((e: unknown) =>
            of(
              TeamActions.memberSaveFailure({
                error: apiErrorMessage(e, "Mitarbeiter konnte nicht entfernt werden"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
