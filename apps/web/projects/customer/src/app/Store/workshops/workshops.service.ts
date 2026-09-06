import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type { Paginated, PublicWorkshop } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { WorkshopsQuery } from "./workshops.state";

@Injectable({ providedIn: "root" })
export class WorkshopsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/customer/workshops`;

  list(query: WorkshopsQuery): Observable<PublicWorkshop[]> {
    let params = new HttpParams().set("pageSize", 100);
    if (query.search) params = params.set("search", query.search);
    if (query.near) {
      params = params
        .set("near", `${query.near.lat},${query.near.lng}`)
        .set("radiusKm", query.radiusKm);
    }
    return this.http
      .get<Paginated<PublicWorkshop>>(this.base, { params })
      .pipe(map((r) => r.items));
  }

  getOne(id: string): Observable<PublicWorkshop> {
    return this.http.get<PublicWorkshop>(`${this.base}/${id}`);
  }
}
