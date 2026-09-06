import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  APPOINTMENT_STATUS_LABELS_DE,
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
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

@Component({
  selector: "ws-appointments-table",
  standalone: true,
  imports: [RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-table.component.html",
  styleUrl: "./appointments-table.component.css",
})
export class AppointmentsTableComponent {
  readonly appointments = input.required<Appointment[]>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;

  tone(status: AppointmentStatus): BadgeTone {
    return TONE[status];
  }

  when(iso: string): string {
    return dateTimeFmt.format(new Date(iso)).replace(",", " ·");
  }

  customerName(appointment: Appointment): string {
    const c = appointment.customer;
    return c ? `${c.firstName} ${c.lastName}` : "—";
  }
}
