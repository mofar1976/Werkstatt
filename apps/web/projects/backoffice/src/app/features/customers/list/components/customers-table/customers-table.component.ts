import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import type { AdminCustomer } from "@car-garage/shared";
import { BadgeComponent } from "../../../../../shared";

@Component({
  selector: "bo-customers-table",
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./customers-table.component.html",
  styleUrl: "./customers-table.component.css",
})
export class CustomersTableComponent {
  readonly customers = input.required<AdminCustomer[]>();
}
