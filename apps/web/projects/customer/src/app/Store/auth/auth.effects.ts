import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { concatLatestFrom } from "@ngrx/operators";
import { Store } from "@ngrx/store";
import {
  catchError,
  exhaustMap,
  map,
  of,
  switchMap,
  tap,
} from "rxjs";
import { AuthService } from "./auth.service";
import { StorageService } from "../../core/services";
import { ROUTES } from "../../core/config";
import { apiErrorMessage } from "../../shared";
import { AuthActions } from "./auth.actions";
import { selectAuthTokens } from "./auth.selectors";

export const login$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ email, password }) =>
        api.login({ email, password }).pipe(
          map((result) => AuthActions.loginSuccess({ result })),
          catchError((error: unknown) =>
            of(
              AuthActions.loginFailure({
                error: apiErrorMessage(error, "Anmeldung fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const register$ = createEffect(
  (actions$ = inject(Actions), api = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ input }) =>
        api.register(input).pipe(
          map((result) => AuthActions.loginSuccess({ result })),
          catchError((error: unknown) =>
            of(
              AuthActions.loginFailure({
                error: apiErrorMessage(error, "Registrierung fehlgeschlagen"),
              }),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const persistSession$ = createEffect(
  (actions$ = inject(Actions), storage = inject(StorageService)) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ result }) => storage.saveSession(result.user, result.tokens)),
    ),
  { functional: true, dispatch: false },
);

export const redirectAfterLogin$ = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => void router.navigateByUrl(ROUTES.dashboard)),
    ),
  { functional: true, dispatch: false },
);

export const restoreSession$ = createEffect(
  (actions$ = inject(Actions), storage = inject(StorageService), api = inject(AuthService)) =>
    actions$.pipe(
      ofType(AuthActions.restoreSession),
      switchMap(() => {
        const tokens = storage.getTokens();
        if (!tokens) return of(AuthActions.noSession());
        return api.me().pipe(
          map((user) => AuthActions.sessionRestored({ user, tokens })),
          catchError(() => of(AuthActions.sessionExpired())),
        );
      }),
    ),
  { functional: true },
);

export const logout$ = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    api = inject(AuthService),
    storage = inject(StorageService),
    router = inject(Router),
  ) =>
    actions$.pipe(
      ofType(AuthActions.logout, AuthActions.sessionExpired),
      concatLatestFrom(() => store.select(selectAuthTokens)),
      tap(([, tokens]) => {
        if (tokens?.refreshToken) {
          api.logout(tokens.refreshToken).subscribe({ error: () => undefined });
        }
        storage.clear();
        void router.navigateByUrl(ROUTES.login);
      }),
    ),
  { functional: true, dispatch: false },
);
