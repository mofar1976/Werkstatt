import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";

/** HTTP access to the ADMIN auth portal (/api/auth/admin/*). */
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/auth/admin`;

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, body);
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/me`);
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, { refreshToken });
  }
}
