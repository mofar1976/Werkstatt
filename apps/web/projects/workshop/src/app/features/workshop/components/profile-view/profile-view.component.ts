import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { DatePipe } from "@angular/common";
import {
  WORKSHOP_STATUS_LABELS_DE,
  WorkshopStatus,
  type Workshop,
} from "@car-garage/shared";
import { BadgeComponent, type BadgeTone } from "../../../../shared";

const TONE: Record<WorkshopStatus, BadgeTone> = {
  [WorkshopStatus.ACTIVE]: "green",
  [WorkshopStatus.PENDING]: "amber",
  [WorkshopStatus.SUSPENDED]: "red",
};

@Component({
  selector: "ws-profile-view",
  standalone: true,
  imports: [DatePipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./profile-view.component.html",
  styleUrl: "./profile-view.component.css",
})
export class ProfileViewComponent {
  readonly workshop = input.required<Workshop>();

  protected readonly label = WORKSHOP_STATUS_LABELS_DE;
  tone(status: WorkshopStatus): BadgeTone {
    return TONE[status];
  }
}
