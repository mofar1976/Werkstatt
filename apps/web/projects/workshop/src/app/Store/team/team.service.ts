import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type { WorkshopMember } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { AddMemberInput, UpdateMemberInput } from "./team.state";

/** HTTP access to the current workshop's team (/api/workshop/my-workshop/members). */
@Injectable({ providedIn: "root" })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/workshop/my-workshop/members`;

  listMembers(): Observable<WorkshopMember[]> {
    return this.http
      .get<{ items: WorkshopMember[] }>(this.base)
      .pipe(map((r) => r.items));
  }

  addMember(input: AddMemberInput): Observable<WorkshopMember> {
    return this.http.post<WorkshopMember>(this.base, input);
  }

  updateMember(
    memberId: string,
    input: UpdateMemberInput,
  ): Observable<WorkshopMember> {
    return this.http.patch<WorkshopMember>(`${this.base}/${memberId}`, input);
  }

  removeMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${memberId}`);
  }
}
