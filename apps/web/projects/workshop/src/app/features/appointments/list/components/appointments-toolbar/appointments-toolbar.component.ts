import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentStatus,
} from "@car-garage/shared";
import type { AppointmentStatusFilter } from "../../../../../Store/appointments";

@Component({
  selector: "ws-appointments-toolbar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-toolbar.component.html",
  styleUrl: "./appointments-toolbar.component.css",
})
export class AppointmentsToolbarComponent {
  readonly statusChange = output<AppointmentStatusFilter>();

  protected readonly statuses = Object.values(AppointmentStatus);
  protected readonly labels = APPOINTMENT_STATUS_LABELS_DE;

  onStatus(value: string): void {
    this.statusChange.emit(value as AppointmentStatusFilter);
  }
}
