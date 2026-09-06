import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type {
  Paginated,
  Workshop,
  WorkshopMember,
  WorkshopRole,
} from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type {
  AddMemberInput,
  WorkshopInput,
  WorkshopsQuery,
} from "./workshops.state";

@Injectable({ providedIn: "root" })
export class WorkshopsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/workshops`;

  list(query: WorkshopsQuery): Observable<Paginated<Workshop>> {
    let params = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.search) params = params.set("search", query.search);
    if (query.status) params = params.set("status", query.status);
    return this.http.get<Paginated<Workshop>>(this.base, { params });
  }

  getOne(id: string): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.base}/${id}`);
  }

  listMembers(id: string): Observable<WorkshopMember[]> {
    return this.http
      .get<{ items: WorkshopMember[] }>(`${this.base}/${id}/members`)
      .pipe(map((r) => r.items));
  }

  create(input: WorkshopInput): Observable<Workshop> {
    return this.http.post<Workshop>(this.base, input);
  }

  update(id: string, input: WorkshopInput): Observable<Workshop> {
    return this.http.patch<Workshop>(`${this.base}/${id}`, input);
  }

  setStatus(id: string, activate: boolean): Observable<Workshop> {
    const action = activate ? "activate" : "deactivate";
    return this.http.post<Workshop>(`${this.base}/${id}/${action}`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addMember(id: string, input: AddMemberInput): Observable<WorkshopMember> {
    return this.http.post<WorkshopMember>(`${this.base}/${id}/members`, input);
  }

  updateMemberRole(
    id: string,
    memberId: string,
    role: WorkshopRole,
  ): Observable<WorkshopMember> {
    return this.http.patch<WorkshopMember>(
      `${this.base}/${id}/members/${memberId}`,
      { role },
    );
  }

  removeMember(id: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/members/${memberId}`);
  }
}
