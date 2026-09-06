import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import type { Observable } from "rxjs";
import type { AdminCustomer, Paginated } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";
import type { CustomerInput, CustomersQuery } from "./customers.state";

@Injectable({ providedIn: "root" })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/customers`;

  list(query: CustomersQuery): Observable<Paginated<AdminCustomer>> {
    let params = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.search) params = params.set("search", query.search);
    if (query.status) params = params.set("status", query.status);
    return this.http.get<Paginated<AdminCustomer>>(this.base, { params });
  }

  getOne(id: string): Observable<AdminCustomer> {
    return this.http.get<AdminCustomer>(`${this.base}/${id}`);
  }

  update(id: string, input: CustomerInput): Observable<AdminCustomer> {
    return this.http.patch<AdminCustomer>(`${this.base}/${id}`, {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });
  }

  setBlocked(id: string, blocked: boolean): Observable<AdminCustomer> {
    const action = blocked ? "block" : "unblock";
    return this.http.post<AdminCustomer>(`${this.base}/${id}/${action}`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
