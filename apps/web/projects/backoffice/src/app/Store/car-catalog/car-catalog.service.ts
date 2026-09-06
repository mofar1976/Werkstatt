import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type { CarBrand, CarModel, Paginated } from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";

interface ListQuery {
  search: string;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: "root" })
export class CarCatalogService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/car-brands`;

  private params(query: ListQuery): HttpParams {
    let p = new HttpParams()
      .set("page", query.page)
      .set("pageSize", query.pageSize);
    if (query.search) p = p.set("search", query.search);
    return p;
  }

  listBrands(query: ListQuery): Observable<Paginated<CarBrand>> {
    return this.http.get<Paginated<CarBrand>>(this.base, {
      params: this.params(query),
    });
  }

  getBrand(id: string): Observable<CarBrand> {
    return this.http.get<CarBrand>(`${this.base}/${id}`);
  }

  createBrand(name: string): Observable<CarBrand> {
    return this.http.post<CarBrand>(this.base, { name });
  }

  updateBrand(id: string, name: string): Observable<CarBrand> {
    return this.http.patch<CarBrand>(`${this.base}/${id}`, { name });
  }

  deleteBrand(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadLogo(brandId: string, file: File): Observable<CarBrand> {
    const form = new FormData();
    form.append("logo", file);
    return this.http.put<CarBrand>(`${this.base}/${brandId}/logo`, form);
  }

  removeLogo(brandId: string): Observable<CarBrand> {
    return this.http.delete<CarBrand>(`${this.base}/${brandId}/logo`);
  }

  listModels(brandId: string): Observable<CarModel[]> {
    return this.http
      .get<Paginated<CarModel>>(`${this.base}/${brandId}/models`, {
        params: new HttpParams().set("pageSize", 200),
      })
      .pipe(map((r) => r.items));
  }

  createModel(brandId: string, name: string): Observable<CarModel> {
    return this.http.post<CarModel>(`${this.base}/${brandId}/models`, { name });
  }

  updateModel(
    brandId: string,
    modelId: string,
    name: string,
  ): Observable<CarModel> {
    return this.http.patch<CarModel>(
      `${this.base}/${brandId}/models/${modelId}`,
      { name },
    );
  }

  deleteModel(brandId: string, modelId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${brandId}/models/${modelId}`);
  }
}
