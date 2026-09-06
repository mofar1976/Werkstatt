import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type { Workshop } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { ProfileInput } from "./profile.state";

/** HTTP access to the current workshop's own profile (/api/workshop/my-workshop). */
@Injectable({ providedIn: "root" })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/workshop/my-workshop`;

  getMyWorkshop(): Observable<Workshop> {
    return this.http.get<Workshop>(this.base);
  }

  updateMyWorkshop(input: ProfileInput): Observable<Workshop> {
    return this.http.patch<Workshop>(this.base, input);
  }
}
