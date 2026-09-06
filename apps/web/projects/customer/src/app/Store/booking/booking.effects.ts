import { inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import { catchError, exhaustMap, forkJoin, map, of, switchMap } from "rxjs";
import { apiErrorMessage } from "../../shared";
import { BookingService } from "./booking.service";
import { BookingActions } from "./booking.actions";
import { selectBookingWorkshopId } from "./booking.selectors";

export const load$ = createEffect(
  (actions$ = inject(Actions), api = inject(BookingService)) =>
    actions$.pipe(
      ofType(BookingActions.opened),
      switchMap(({ workshopId }) =>
        forkJoin({
          workshop: api.workshop(workshopId),
          slots: api.slots(workshopId),
          brands: api.brands(),
        }).pipe(
          map(({ workshop, slots, brands }) =>
            BookingActions.loadSuccess({ workshop, slots, brands }),
          ),
          catchError((e: unknown) =>
            of(
              BookingActions.loadFailure({
                error: apiErrorMessage(
                  e,
                  "Die Werkstatt konnte nicht geladen werden",
                ),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadModels$ = createEffect(
  (actions$ = inject(Actions), api = inject(BookingService)) =>
    actions$.pipe(
      ofType(BookingActions.brandSelected),
      switchMap(({ brandId }) => {
        if (!brandId) return of(BookingActions.modelsLoaded({ brandId, models: [] }));
        return api.models(brandId).pipe(
          map((models) => BookingActions.modelsLoaded({ brandId, models })),
          catchError((e: unknown) =>
            of(
              BookingActions.modelsFailed({
                error: apiErrorMessage(
                  e,
                  "Modelle konnten nicht geladen werden",
                ),
              }),
            ),
          ),
        );
      }),
    ),
  { functional: true },
);

/** The API returns 409 when the slot was taken between load and submit. */
function bookError(e: unknown): string {
  if (e instanceof HttpErrorResponse && e.status === 409) {
    return "Dieser Termin ist leider nicht mehr verfügbar. Bitte wähle einen anderen.";
  }
  return apiErrorMessage(e, "Termin konnte nicht gebucht werden");
}

export const submit$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(BookingService),
  ) =>
    actions$.pipe(
      ofType(BookingActions.submit),
      concatLatestFrom(() => store.select(selectBookingWorkshopId)),
      exhaustMap(([{ input }, workshopId]) => {
        if (!workshopId) {
          return of(
            BookingActions.submitFailure({ error: "Keine Werkstatt gewählt" }),
          );
        }
        return api.book(workshopId, input).pipe(
          map((appointment) => BookingActions.submitSuccess({ appointment })),
          catchError((e: unknown) =>
            of(BookingActions.submitFailure({ error: bookError(e) })),
          ),
        );
      }),
    ),
  { functional: true },
);

/** A failed booking usually means a slot changed under us — refresh the list. */
export const refreshSlotsAfterFailure$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(BookingService),
  ) =>
    actions$.pipe(
      ofType(BookingActions.submitFailure),
      concatLatestFrom(() => store.select(selectBookingWorkshopId)),
      switchMap(([, workshopId]) =>
        workshopId
          ? api
              .slots(workshopId)
              .pipe(
                map((slots) => BookingActions.slotsReloaded({ slots })),
                catchError(() => of(BookingActions.slotsReloaded({ slots: [] }))),
              )
          : of(BookingActions.slotsReloaded({ slots: [] })),
      ),
    ),
  { functional: true },
);
