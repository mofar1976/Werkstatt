import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AppointmentStatus } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
  apiErrorMessage,
} from "../../../shared";
import { AppointmentsFacade } from "../../../Store/appointments";
import { RepairOrdersService } from "../../../Store/repair-orders";
import { AppointmentInfoComponent } from "./components/appointment-info/appointment-info.component";

@Component({
  selector: "ws-appointment-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    AppointmentInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class AppointmentDetailComponent {
  protected readonly facade = inject(AppointmentsFacade);
  private readonly repairService = inject(RepairOrdersService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly appointment = this.facade.selected;
  protected readonly isConfirmed = computed(
    () => this.appointment()?.status === AppointmentStatus.CONFIRMED,
  );
  /** The car has been handed over — a repair order can exist. */
  protected readonly canHaveRepairOrder = computed(() => {
    const s = this.appointment()?.status;
    return s === AppointmentStatus.CONFIRMED || s === AppointmentStatus.COMPLETED;
  });

  protected readonly creating = signal(false);
  protected readonly createError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  createRepairOrder(): void {
    this.creating.set(true);
    this.createError.set(null);
    this.repairService.create(this.id()).subscribe({
      next: (order) => void this.router.navigate(["/repair-orders", order.id]),
      error: (e: unknown) => {
        this.creating.set(false);
        this.createError.set(
          apiErrorMessage(e, "Auftrag konnte nicht angelegt werden"),
        );
      },
    });
  }

  cancel(): void {
    const reason = prompt(
      "Grund der Stornierung (optional, wird der Kundschaft angezeigt):",
    );
    // `null` => the dialog was dismissed; "" => confirmed without a reason.
    if (reason === null) return;
    this.facade.cancel(this.id(), reason.trim() || undefined);
  }

  complete(): void {
    if (confirm("Termin als abgeschlossen markieren?")) {
      this.facade.complete(this.id());
    }
  }
}
