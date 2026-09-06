import { inject } from "@angular/core";
import type { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { catchError, throwError } from "rxjs";
import { AuthActions } from "../../Store/auth";

/** On a 401 from the API, drop the session (except on the auth calls themselves). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthCall = /\/auth\/customer\/(login|register)$/.test(req.url);
      if (error.status === 401 && !isAuthCall) {
        store.dispatch(AuthActions.sessionExpired());
      }
      return throwError(() => error);
    }),
  );
};
