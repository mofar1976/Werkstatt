import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AlertComponent, SpinnerComponent } from "../../shared";
import { BookingFacade } from "../../Store/booking";
import { BookingSummaryComponent } from "./components/booking-summary/booking-summary.component";
import { SlotPickerComponent } from "./components/slot-picker/slot-picker.component";
import {
  BookingFormComponent,
  type BookingFormValue,
} from "./components/booking-form/booking-form.component";

@Component({
  selector: "cu-booking",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    SpinnerComponent,
    BookingSummaryComponent,
    SlotPickerComponent,
    BookingFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./booking.component.html",
})
export class BookingComponent {
  protected readonly facade = inject(BookingFacade);
  private readonly router = inject(Router);

  readonly workshopId = input.required<string>();

  protected readonly selectedSlotId = signal<string | null>(null);

  constructor() {
    effect(() => this.facade.open(this.workshopId()));

    effect(() => {
      const id = this.facade.bookedAppointmentId();
      if (id) void this.router.navigate(["/appointments", id]);
    });

    // Drop the selection if the slot vanished (e.g. taken by someone else).
    effect(() => {
      const selected = this.selectedSlotId();
      if (selected && !this.facade.slots().some((s) => s.id === selected)) {
        this.selectedSlotId.set(null);
      }
    });

    inject(DestroyRef).onDestroy(() => this.facade.leave());
  }

  pickSlot(slotId: string): void {
    this.selectedSlotId.set(slotId);
  }

  book(value: BookingFormValue): void {
    const slotId = this.selectedSlotId();
    if (!slotId) return;
    this.facade.submit({
      slotId,
      problemDescription: value.problemDescription,
      vehicle: {
        brandId: value.brandId,
        modelId: value.modelId,
        licensePlate: value.licensePlate,
      },
    });
  }
}
