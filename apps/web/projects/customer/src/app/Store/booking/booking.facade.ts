import { Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import type { BookAppointmentRequest } from "@car-garage/shared";
import { BookingActions } from "./booking.actions";
import {
  selectBookedAppointmentId,
  selectBookingBrands,
  selectBookingError,
  selectBookingLoading,
  selectBookingModels,
  selectBookingModelsLoading,
  selectBookingSlots,
  selectBookingSubmitError,
  selectBookingSubmitting,
  selectBookingWorkshop,
} from "./booking.selectors";

@Injectable({ providedIn: "root" })
export class BookingFacade {
  private readonly store = inject(Store);

  readonly workshop = this.store.selectSignal(selectBookingWorkshop);
  readonly slots = this.store.selectSignal(selectBookingSlots);
  readonly brands = this.store.selectSignal(selectBookingBrands);
  readonly models = this.store.selectSignal(selectBookingModels);
  readonly modelsLoading = this.store.selectSignal(selectBookingModelsLoading);
  readonly loading = this.store.selectSignal(selectBookingLoading);
  readonly error = this.store.selectSignal(selectBookingError);
  readonly submitting = this.store.selectSignal(selectBookingSubmitting);
  readonly submitError = this.store.selectSignal(selectBookingSubmitError);
  readonly bookedAppointmentId = this.store.selectSignal(
    selectBookedAppointmentId,
  );

  open(workshopId: string): void {
    this.store.dispatch(BookingActions.opened({ workshopId }));
  }
  selectBrand(brandId: string): void {
    this.store.dispatch(BookingActions.brandSelected({ brandId }));
  }
  submit(input: BookAppointmentRequest): void {
    this.store.dispatch(BookingActions.submit({ input }));
  }
  leave(): void {
    this.store.dispatch(BookingActions.left());
  }
}
