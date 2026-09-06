import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { AuthActions } from "./auth.actions";
import {
  selectAuthError,
  selectAuthLoading,
  selectAuthTokens,
  selectAuthUser,
  selectIsAuthenticated,
} from "./auth.selectors";

/** Component-facing wrapper around the auth store slice. */
@Injectable({ providedIn: "root" })
export class AuthFacade {
  private readonly store = inject(Store);

  readonly user = this.store.selectSignal(selectAuthUser);
  readonly tokens = this.store.selectSignal(selectAuthTokens);
  readonly loading = this.store.selectSignal(selectAuthLoading);
  readonly error = this.store.selectSignal(selectAuthError);
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);

  login(email: string, password: string): void {
    this.store.dispatch(AuthActions.login({ email, password }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  restoreSession(): void {
    this.store.dispatch(AuthActions.restoreSession());
  }
}
