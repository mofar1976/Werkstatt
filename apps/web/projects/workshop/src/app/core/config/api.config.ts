import { InjectionToken, type Provider } from "@angular/core";
import { environment } from "../../../environments/environment";

/** Base URL of the API, e.g. http://localhost:4000/api */
export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL");

export function provideApiConfig(): Provider {
  return { provide: API_BASE_URL, useValue: environment.apiUrl };
}
