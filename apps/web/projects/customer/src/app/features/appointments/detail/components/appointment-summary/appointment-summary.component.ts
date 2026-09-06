import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentActor,
  AppointmentStatus,
  type Appointment,
} from "@car-garage/shared";
import {
  BadgeComponent,
  formatDate,
  formatTime,
  type BadgeTone,
} from "../../../../../shared";

const TONE: Record<AppointmentStatus, BadgeTone> = {
  [AppointmentStatus.CONFIRMED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "gray",
};

@Component({
  selector: "cu-appointment-summary",
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointment-summary.component.html",
  styleUrl: "./appointment-summary.component.css",
})
export class AppointmentSummaryComponent {
  readonly appointment = input.required<Appointment>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly Actor = AppointmentActor;
  protected readonly day = formatDate;
  protected readonly time = formatTime;

  tone(status: AppointmentStatus): BadgeTone {
    return TONE[status];
  }

  vehicle(appointment: Appointment): string {
    const v = appointment.vehicle;
    return `${v.brandName} ${v.modelName}`;
  }
}
