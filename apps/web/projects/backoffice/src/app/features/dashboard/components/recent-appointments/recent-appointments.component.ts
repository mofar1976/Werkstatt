import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  type Appointment,
} from "@car-garage/shared";
import { BadgeComponent, appointmentStatusTone } from "../../../../shared";

@Component({
  selector: "bo-recent-appointments",
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./recent-appointments.component.html",
  styleUrl: "./recent-appointments.component.css",
})
export class RecentAppointmentsComponent {
  readonly appointments = input.required<Appointment[]>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly tone = appointmentStatusTone;

  customerName(appointment: Appointment): string {
    const c = appointment.customer;
    return c ? `${c.firstName} ${c.lastName}` : "—";
  }
}
