import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import {
  WORKSHOP_STATUS_LABELS_DE,
  WorkshopStatus,
  type Workshop,
} from "@car-garage/shared";
import { BadgeComponent, type BadgeTone } from "../../../../../shared";

const STATUS_TONE: Record<WorkshopStatus, BadgeTone> = {
  [WorkshopStatus.ACTIVE]: "green",
  [WorkshopStatus.PENDING]: "amber",
  [WorkshopStatus.SUSPENDED]: "red",
};

@Component({
  selector: "bo-workshops-table",
  standalone: true,
  imports: [DatePipe, RouterLink, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshops-table.component.html",
  styleUrl: "./workshops-table.component.css",
})
export class WorkshopsTableComponent {
  readonly workshops = input.required<Workshop[]>();

  protected readonly label = WORKSHOP_STATUS_LABELS_DE;
  protected tone(status: WorkshopStatus): BadgeTone {
    return STATUS_TONE[status];
  }
}
