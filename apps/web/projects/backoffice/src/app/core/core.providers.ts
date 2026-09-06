import type { HttpInterceptorFn } from "@angular/common/http";
import type { Provider } from "@angular/core";
import { TitleStrategy } from "@angular/router";
import { BackofficeTitleStrategy, provideApiConfig } from "./config";
import { authInterceptor, errorInterceptor } from "./interceptors";

/** App-wide singleton providers (used instead of a CoreModule). */
export const coreProviders: Provider[] = [
  provideApiConfig(),
  { provide: TitleStrategy, useClass: BackofficeTitleStrategy },
];

/** HTTP interceptors, in execution order. */
export const httpInterceptors: HttpInterceptorFn[] = [
  authInterceptor,
  errorInterceptor,
];
