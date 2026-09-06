import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { map, type Observable } from "rxjs";
import type {
  Appointment,
  BookAppointmentRequest,
  CarBrand,
  CarModel,
  PublicSlot,
  PublicWorkshop,
} from "@car-garage/shared";
import { API_BASE_URL } from "../../core/config";

/** HTTP access for the "book an appointment" flow. */
@Injectable({ providedIn: "root" })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/customer`;

  workshop(workshopId: string): Observable<PublicWorkshop> {
    return this.http.get<PublicWorkshop>(`${this.base}/workshops/${workshopId}`);
  }

  slots(workshopId: string): Observable<PublicSlot[]> {
    return this.http
      .get<{ items: PublicSlot[] }>(`${this.base}/workshops/${workshopId}/slots`)
      .pipe(map((r) => r.items));
  }

  brands(): Observable<CarBrand[]> {
    return this.http
      .get<{ items: CarBrand[] }>(`${this.base}/car-brands`)
      .pipe(map((r) => r.items));
  }

  models(brandId: string): Observable<CarModel[]> {
    return this.http
      .get<{ items: CarModel[] }>(`${this.base}/car-brands/${brandId}/models`)
      .pipe(map((r) => r.items));
  }

  book(
    workshopId: string,
    input: BookAppointmentRequest,
  ): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.base}/workshops/${workshopId}/appointments`,
      input,
    );
  }
}
