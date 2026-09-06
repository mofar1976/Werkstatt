import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from "@angular/core";
import { AlertComponent, SpinnerComponent } from "../../shared";
import { AvailabilityFacade } from "../../Store/availability";
import type { CreateSlotInput } from "../../Store/availability";
import { SlotFormComponent } from "./components/slot-form/slot-form.component";
import { SlotListComponent } from "./components/slot-list/slot-list.component";

@Component({
  selector: "ws-availability",
  standalone: true,
  imports: [
    AlertComponent,
    SpinnerComponent,
    SlotFormComponent,
    SlotListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./availability.component.html",
})
export class AvailabilityComponent {
  protected readonly facade = inject(AvailabilityFacade);

  constructor() {
    this.facade.open();
    inject(DestroyRef).onDestroy(() => this.facade.leave());
  }

  create(input: CreateSlotInput): void {
    this.facade.createSlot(input);
  }
}
