import { inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, mergeMap, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { AvailabilityService } from "./availability.service";
import { AvailabilityActions } from "./availability.actions";

const LIST_ERROR = "Verfügbarkeiten konnten nicht geladen werden";

/** Map the API's (English) slot errors to German UI text. */
function slotError(
  e: unknown,
  messages: { conflict?: string; badRequest?: string; fallback: string },
): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 409 && messages.conflict) return messages.conflict;
    if (e.status === 400 && messages.badRequest) return messages.badRequest;
  }
  return apiErrorMessage(e, messages.fallback);
}

/** Midnight of the current local day, as an ISO string. */
function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const triggerLoad$ = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AvailabilityActions.opened),
      map(() => AvailabilityActions.load()),
    ),
  { functional: true },
);

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(AvailabilityService)) =>
    actions$.pipe(
      ofType(AvailabilityActions.load),
      switchMap(() =>
        api.listSlots(startOfToday()).pipe(
          map((slots) => AvailabilityActions.loadSuccess({ slots })),
          catchError((e: unknown) =>
            of(
              AvailabilityActions.loadFailure({
                error: apiErrorMessage(e, LIST_ERROR),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const createSlot$ = createEffect(
  (actions$ = inject(Actions), api = inject(AvailabilityService)) =>
    actions$.pipe(
      ofType(AvailabilityActions.createSlot),
      exhaustMap(({ input }) =>
        api.createSlot(input).pipe(
          switchMap(() => api.listSlots(startOfToday())),
          map((slots) => AvailabilityActions.slotsChanged({ slots })),
          catchError((e: unknown) =>
            of(
              AvailabilityActions.slotSaveFailure({
                error: slotError(e, {
                  conflict:
                    "Dieses Zeitfenster überschneidet sich mit einem bestehenden.",
                  badRequest: "Das Zeitfenster muss in der Zukunft liegen.",
                  fallback: "Zeitfenster konnte nicht angelegt werden",
                }),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const setStatus$ = createEffect(
  (actions$ = inject(Actions), api = inject(AvailabilityService)) =>
    actions$.pipe(
      ofType(AvailabilityActions.setSlotStatus),
      mergeMap(({ slotId, status }) =>
        api.setStatus(slotId, status).pipe(
          switchMap(() => api.listSlots(startOfToday())),
          map((slots) => AvailabilityActions.slotsChanged({ slots })),
          catchError((e: unknown) =>
            of(
              AvailabilityActions.slotSaveFailure({
                error: slotError(e, {
                  conflict: "Ein gebuchtes Zeitfenster kann nicht geändert werden.",
                  fallback: "Status konnte nicht geändert werden",
                }),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const deleteSlot$ = createEffect(
  (actions$ = inject(Actions), api = inject(AvailabilityService)) =>
    actions$.pipe(
      ofType(AvailabilityActions.deleteSlot),
      mergeMap(({ slotId }) =>
        api.deleteSlot(slotId).pipe(
          switchMap(() => api.listSlots(startOfToday())),
          map((slots) => AvailabilityActions.slotsChanged({ slots })),
          catchError((e: unknown) =>
            of(
              AvailabilityActions.slotSaveFailure({
                error: slotError(e, {
                  conflict:
                    "Ein gebuchtes Zeitfenster kann nicht gelöscht werden – storniere zuerst den Termin.",
                  fallback: "Zeitfenster konnte nicht gelöscht werden",
                }),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);
