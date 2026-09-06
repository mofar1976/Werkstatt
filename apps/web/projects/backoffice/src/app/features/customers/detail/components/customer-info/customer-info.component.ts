import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import type { AdminCustomer } from "@car-garage/shared";
import { BadgeComponent } from "../../../../../shared";

@Component({
  selector: "bo-customer-info",
  standalone: true,
  imports: [DatePipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./customer-info.component.html",
  styleUrl: "./customer-info.component.css",
})
export class CustomerInfoComponent {
  readonly customer = input.required<AdminCustomer>();
}
