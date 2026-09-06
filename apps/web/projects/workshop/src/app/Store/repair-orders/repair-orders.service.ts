import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type {
  Appointment,
  Paginated,
  RepairAssignee,
  RepairOrder,
  RepairOrderDetail,
  WorkshopMember,
} from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { DiagnosisInput, RepairOrdersQuery } from "./repair-orders.state";

@Injectable({ providedIn: "root" })
export class RepairOrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly base = `${this.apiBase}/workshop/my-workshop/repair-orders`;

  list(query: RepairOrdersQuery): Observable<Paginated<RepairOrder>> {
    let params = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.status) params = params.set("status", query.status);
    return this.http.get<Paginated<RepairOrder>>(this.base, { params });
  }

  getOne(id: string): Observable<RepairOrderDetail> {
    return this.http.get<RepairOrderDetail>(`${this.base}/${id}`);
  }

  create(appointmentId: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(this.base, { appointmentId });
  }

  /** Appointments that could still become a repair order. */
  listCandidates(): Observable<Appointment[]> {
    return this.http
      .get<{ items: Appointment[] }>(`${this.base}/candidates`)
      .pipe(map((r) => r.items));
  }

  saveDiagnosis(
    id: string,
    input: DiagnosisInput,
  ): Observable<RepairOrderDetail> {
    return this.http.patch<RepairOrderDetail>(
      `${this.base}/${id}/diagnosis`,
      input,
    );
  }

  setAssignees(
    id: string,
    memberIds: string[],
  ): Observable<RepairOrderDetail> {
    return this.http.put<RepairOrderDetail>(`${this.base}/${id}/assignees`, {
      memberIds,
    });
  }

  sendQuote(id: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/send-quote`, {});
  }

  advanceStatus(
    id: string,
    status: string,
    note?: string,
  ): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/status`, {
      status,
      note,
    });
  }

  addNote(id: string, message: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/notes`, {
      message,
    });
  }

  cancel(id: string, reason?: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/cancel`, {
      reason,
    });
  }

  /** Team members, shaped for the assignee picker. */
  listTeamMembers(): Observable<RepairAssignee[]> {
    return this.http
      .get<{ items: WorkshopMember[] }>(
        `${this.apiBase}/workshop/my-workshop/members`,
      )
      .pipe(
        map((r) =>
          r.items.map((m) => ({
            id: m.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
          })),
        ),
      );
  }
}
