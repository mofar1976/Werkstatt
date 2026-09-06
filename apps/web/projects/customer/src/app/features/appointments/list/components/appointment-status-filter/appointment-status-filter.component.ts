import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { APPOINTMENT_STATUS_LABELS_DE } from "@car-garage/shared";
import type { AppointmentStatusFilter } from "../../../../../Store/appointments";

@Component({
  selector: "cu-appointment-status-filter",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointment-status-filter.component.html",
  styleUrl: "./appointment-status-filter.component.css",
})
export class AppointmentStatusFilterComponent {
  readonly status = input<AppointmentStatusFilter>("");
  readonly statusChange = output<AppointmentStatusFilter>();

  protected readonly options: { value: AppointmentStatusFilter; label: string }[] =
    [
      { value: "", label: "Alle Termine" },
      { value: "CONFIRMED", label: APPOINTMENT_STATUS_LABELS_DE.CONFIRMED },
      { value: "COMPLETED", label: APPOINTMENT_STATUS_LABELS_DE.COMPLETED },
      { value: "CANCELLED", label: APPOINTMENT_STATUS_LABELS_DE.CANCELLED },
    ];

  onChange(value: string): void {
    this.statusChange.emit(value as AppointmentStatusFilter);
  }
}
