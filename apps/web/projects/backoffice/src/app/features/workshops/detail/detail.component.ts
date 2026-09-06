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
import { WorkshopStatus } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../../shared";
import { WorkshopsFacade } from "../../../Store/workshops";
import { WorkshopInfoComponent } from "./components/workshop-info/workshop-info.component";
import { WorkshopMembersComponent } from "./components/workshop-members/workshop-members.component";

@Component({
  selector: "bo-workshop-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    WorkshopInfoComponent,
    WorkshopMembersComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class WorkshopDetailComponent {
  protected readonly facade = inject(WorkshopsFacade);

  readonly id = input.required<string>();

  protected readonly workshop = this.facade.selected;
  protected readonly isActive = computed(
    () => this.workshop()?.status === WorkshopStatus.ACTIVE,
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  toggleStatus(): void {
    this.facade.toggleStatus(this.id(), !this.isActive());
  }

  remove(): void {
    if (
      confirm(
        "Werkstatt wirklich löschen? Mitarbeiterkonten werden deaktiviert.",
      )
    ) {
      this.facade.remove(this.id());
    }
  }
}
