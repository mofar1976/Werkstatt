import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type { Appointment, Paginated } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { AppointmentsQuery } from "./appointments.state";

/** HTTP access to the signed-in customer's own appointments. */
@Injectable({ providedIn: "root" })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/customer/appointments`;

  list(query: AppointmentsQuery): Observable<Paginated<Appointment>> {
    let params = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.status) params = params.set("status", query.status);
    return this.http.get<Paginated<Appointment>>(this.base, { params });
  }

  getOne(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.base}/${id}`);
  }

  cancel(id: string, reason?: string): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.base}/${id}/cancel`, { reason });
  }
}
