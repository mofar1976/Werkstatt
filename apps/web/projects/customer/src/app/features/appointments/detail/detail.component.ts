import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AppointmentStatus } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../../shared";
import { AppointmentsFacade } from "../../../Store/appointments";
import { AppointmentSummaryComponent } from "./components/appointment-summary/appointment-summary.component";

@Component({
  selector: "cu-appointment-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    AppointmentSummaryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class AppointmentDetailComponent {
  protected readonly facade = inject(AppointmentsFacade);

  readonly id = input.required<string>();

  protected readonly appointment = this.facade.selected;

  /** A confirmed appointment in the future can still be cancelled. */
  protected readonly canCancel = computed(() => {
    const a = this.appointment();
    return (
      !!a &&
      a.status === AppointmentStatus.CONFIRMED &&
      new Date(a.scheduledAt).getTime() > Date.now()
    );
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  cancel(): void {
    const reason = prompt("Warum möchtest du den Termin stornieren? (optional)");
    // `null` => dialog dismissed; "" => confirmed without a reason.
    if (reason === null) return;
    this.facade.cancel(this.id(), reason.trim() || undefined);
  }
}
