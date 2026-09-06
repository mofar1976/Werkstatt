import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { PublicWorkshop } from "@car-garage/shared";

@Component({
  selector: "cu-workshop-info",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./workshop-info.component.html",
  styleUrl: "./workshop-info.component.css",
})
export class WorkshopInfoComponent {
  readonly workshop = input.required<PublicWorkshop>();
}
