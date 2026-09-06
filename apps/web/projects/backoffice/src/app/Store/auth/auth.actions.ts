import { createActionGroup, emptyProps, props } from "@ngrx/store";
import type { AuthResponse, AuthTokens, AuthUser } from "@car-garage/shared";

export const AuthActions = createActionGroup({
  source: "Auth",
  events: {
    "Login": props<{ email: string; password: string }>(),
    "Login Success": props<{ result: AuthResponse }>(),
    "Login Failure": props<{ error: string }>(),

    "Logout": emptyProps(),
    "Session Expired": emptyProps(),

    // Fired on app start to hydrate from persisted storage.
    "Restore Session": emptyProps(),
    "Session Restored": props<{ user: AuthUser; tokens: AuthTokens }>(),
    "No Session": emptyProps(),
  },
});
