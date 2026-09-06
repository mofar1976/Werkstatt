import { inject } from "@angular/core";
import type { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { Store } from "@ngrx/store";
import { catchError, throwError } from "rxjs";
import { AuthActions } from "../../Store/auth";

/** On a 401 from the API, drop the session. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginCall = req.url.endsWith("/auth/workshop/login");
      if (error.status === 401 && !isLoginCall) {
        store.dispatch(AuthActions.sessionExpired());
      }
      return throwError(() => error);
    }),
  );
};
