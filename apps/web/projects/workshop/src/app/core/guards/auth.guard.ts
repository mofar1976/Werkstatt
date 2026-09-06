import { inject } from "@angular/core";
import { Router, type CanActivateFn } from "@angular/router";
import { AuthFacade } from "../../Store/auth";

/** Allow the route only for an authenticated workshop user, else send to /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(["/login"]);
};
