import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  WORKSHOP_STATUS_LABELS_DE,
  WorkshopStatus,
  type Workshop,
} from "@car-garage/shared";
import { BadgeComponent, type BadgeTone } from "../../../../../shared";

const TONE: Record<WorkshopStatus, BadgeTone> = {
  [WorkshopStatus.ACTIVE]: "green",
  [WorkshopStatus.PENDING]: "amber",
  [WorkshopStatus.SUSPENDED]: "red",
};

@Component({
  selector: "bo-workshop-info",
  standalone: true,
  imports: [DatePipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-info.component.html",
  styleUrl: "./workshop-info.component.css",
})
export class WorkshopInfoComponent {
  readonly workshop = input.required<Workshop>();

  protected readonly label = WORKSHOP_STATUS_LABELS_DE;
  protected tone(status: WorkshopStatus): BadgeTone {
    return TONE[status];
  }
}
