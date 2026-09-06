import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type { AdminOverview } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/overview`;

  overview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>(this.base);
  }
}
