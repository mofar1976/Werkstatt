import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentStatus,
  type Appointment,
} from "@car-garage/shared";
import {
  BadgeComponent,
  formatDateTime,
  type BadgeTone,
} from "../../../../../shared";

const TONE: Record<AppointmentStatus, BadgeTone> = {
  [AppointmentStatus.CONFIRMED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "gray",
};

@Component({
  selector: "cu-appointments-list",
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-list.component.html",
  styleUrl: "./appointments-list.component.css",
})
export class AppointmentsListComponent {
  readonly appointments = input.required<Appointment[]>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly when = formatDateTime;

  tone(status: AppointmentStatus): BadgeTone {
    return TONE[status];
  }

  vehicle(appointment: Appointment): string {
    const v = appointment.vehicle;
    const base = `${v.brandName} ${v.modelName}`;
    return v.licensePlate ? `${base} · ${v.licensePlate}` : base;
  }
}
