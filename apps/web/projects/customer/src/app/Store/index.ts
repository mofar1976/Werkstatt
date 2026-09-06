import { isDevMode, type EnvironmentProviders } from "@angular/core";
import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { AUTH_FEATURE_KEY, authEffects, authReducer } from "./auth";

export * from "./auth";
// Lazy features — registered by their route via provideState/provideEffects.
export * from "./workshops";
export * from "./appointments";
export * from "./booking";
export * from "./repairs";

/** Root NgRx setup for the Customer portal. */
export function provideAppStore(): EnvironmentProviders[] {
  return [
    provideStore({
      [AUTH_FEATURE_KEY]: authReducer,
    }),
    provideEffects(authEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    }),
  ];
}
