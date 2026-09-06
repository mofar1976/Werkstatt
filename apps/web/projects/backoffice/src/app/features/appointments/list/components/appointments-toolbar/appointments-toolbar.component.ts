import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentStatus,
} from "@car-garage/shared";
import type { AppointmentStatusFilter } from "../../../../../Store/appointments";

@Component({
  selector: "bo-appointments-toolbar",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-toolbar.component.html",
  styleUrl: "./appointments-toolbar.component.css",
})
export class AppointmentsToolbarComponent {
  readonly statusChange = output<AppointmentStatusFilter>();

  protected readonly labels = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly statuses: AppointmentStatus[] = [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ];

  onStatus(value: string): void {
    this.statusChange.emit(value as AppointmentStatusFilter);
  }
}
