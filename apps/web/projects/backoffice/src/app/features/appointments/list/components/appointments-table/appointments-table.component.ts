import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  AppointmentStatus,
  type Appointment,
} from "@car-garage/shared";
import { BadgeComponent, appointmentStatusTone } from "../../../../../shared";

@Component({
  selector: "bo-appointments-table",
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./appointments-table.component.html",
  styleUrl: "./appointments-table.component.css",
})
export class AppointmentsTableComponent {
  readonly appointments = input.required<Appointment[]>();

  protected readonly label = APPOINTMENT_STATUS_LABELS_DE;
  protected readonly tone = appointmentStatusTone;
  protected readonly Cancelled = AppointmentStatus.CANCELLED;

  customerName(appointment: Appointment): string {
    const c = appointment.customer;
    return c ? `${c.firstName} ${c.lastName}` : "—";
  }

  vehicle(appointment: Appointment): string {
    const v = appointment.vehicle;
    return v.licensePlate
      ? `${v.brandName} ${v.modelName} · ${v.licensePlate}`
      : `${v.brandName} ${v.modelName}`;
  }
}
