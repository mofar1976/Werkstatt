import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import {
  APPOINTMENT_STATUS_LABELS_DE,
  type Appointment,
} from "@car-garage/shared";
import { SpinnerComponent } from "../../../../../shared";

const fmt = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

@Component({
  selector: "ws-new-order-panel",
  standalone: true,
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./new-order-panel.component.html",
  styleUrl: "./new-order-panel.component.css",
})
export class NewOrderPanelComponent {
  readonly candidates = input.required<Appointment[]>();
  readonly loading = input(false);
  readonly saving = input(false);
  readonly pick = output<string>();

  protected readonly statusLabel = APPOINTMENT_STATUS_LABELS_DE;

  when(iso: string): string {
    return fmt.format(new Date(iso));
  }

  customerName(a: Appointment): string {
    return a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : "—";
  }
}
