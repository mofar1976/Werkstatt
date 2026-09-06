import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentActor,
  AppointmentStatus,
  type Appointment,
} from "@car-garage/shared";
import { BadgeComponent, type BadgeTone } from "../../../../../shared";

const TONE: Record<AppointmentStatus, BadgeTone> = {
  [AppointmentStatus.CONFIRMED]: "blue",
  [AppointmentStatus.COMPLETED]: "green",
  [AppointmentStatus.CANCELLED]: "gray",
};

const dateTimeFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

@Component({
  selector: "ws-appointment-info",
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointment-info.component.html",
  styleUrl: "./appointment-info.component.css",
})
export class AppointmentInfoComponent {
  readonly appointment = input.required<Appointment>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly Actor = AppointmentActor;

  tone(status: AppointmentStatus): BadgeTone {
    return TONE[status];
  }

  when(iso: string): string {
    return dateTimeFmt.format(new Date(iso));
  }
}
