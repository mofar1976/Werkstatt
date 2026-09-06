import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type { AppointmentSlot } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { CreateSlotInput } from "./availability.state";

/** HTTP access to the current workshop's availability slots. */
@Injectable({ providedIn: "root" })
export class AvailabilityService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/workshop/my-workshop/slots`;

  /** All slots from `from` (ISO) onwards, sorted by start. */
  listSlots(from: string): Observable<AppointmentSlot[]> {
    return this.http
      .get<{ items: AppointmentSlot[] }>(this.base, {
        params: new HttpParams().set("from", from),
      })
      .pipe(map((r) => r.items));
  }

  createSlot(input: CreateSlotInput): Observable<AppointmentSlot> {
    return this.http.post<AppointmentSlot>(this.base, input);
  }

  setStatus(
    slotId: string,
    status: "OPEN" | "BLOCKED",
  ): Observable<AppointmentSlot> {
    return this.http.patch<AppointmentSlot>(`${this.base}/${slotId}`, { status });
  }

  deleteSlot(slotId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${slotId}`);
  }
}
