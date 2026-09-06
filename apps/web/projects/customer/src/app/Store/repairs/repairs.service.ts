import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type {
  Paginated,
  RepairOrder,
  RepairOrderDetail,
} from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { RepairsQuery } from "./repairs.state";

/** HTTP access to the signed-in customer's own repair orders. */
@Injectable({ providedIn: "root" })
export class RepairsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/customer/repair-orders`;

  list(query: RepairsQuery): Observable<Paginated<RepairOrder>> {
    let params = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.status) params = params.set("status", query.status);
    return this.http.get<Paginated<RepairOrder>>(this.base, { params });
  }

  getOne(id: string): Observable<RepairOrderDetail> {
    return this.http.get<RepairOrderDetail>(`${this.base}/${id}`);
  }

  approve(id: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/approve`, {});
  }

  reject(id: string, reason?: string): Observable<RepairOrderDetail> {
    return this.http.post<RepairOrderDetail>(`${this.base}/${id}/reject`, {
      reason,
    });
  }
}
