import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AlertComponent, SpinnerComponent } from "../../../shared";
import { WorkshopsFacade } from "../../../Store/workshops";
import { WorkshopMapComponent } from "../list/components/workshop-map/workshop-map.component";
import { WorkshopInfoComponent } from "./components/workshop-info/workshop-info.component";

@Component({
  selector: "cu-workshop-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    SpinnerComponent,
    WorkshopMapComponent,
    WorkshopInfoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class WorkshopDetailComponent {
  protected readonly facade = inject(WorkshopsFacade);

  readonly id = input.required<string>();

  protected readonly workshop = this.facade.selected;
  protected readonly markers = computed(() => {
    const w = this.workshop();
    return w ? [w] : [];
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }
}
