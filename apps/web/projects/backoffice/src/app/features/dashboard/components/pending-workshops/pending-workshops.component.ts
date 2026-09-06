import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import type { PendingWorkshopSummary } from "@car-garage/shared";

@Component({
  selector: "bo-pending-workshops",
  standalone: true,
  imports: [DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./pending-workshops.component.html",
  styleUrl: "./pending-workshops.component.css",
})
export class PendingWorkshopsComponent {
  readonly workshops = input.required<PendingWorkshopSummary[]>();
}
