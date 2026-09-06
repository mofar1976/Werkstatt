import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { PublicWorkshop } from "@car-garage/shared";

@Component({
  selector: "cu-booking-summary",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./booking-summary.component.html",
  styleUrl: "./booking-summary.component.css",
})
export class BookingSummaryComponent {
  readonly workshop = input.required<PublicWorkshop>();
}
