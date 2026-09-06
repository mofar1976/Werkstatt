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
import { RepairOrderStatus } from "@car-garage/shared";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../../shared";
import { RepairsFacade } from "../../../Store/repairs";
import { RepairInfoComponent } from "./components/repair-info/repair-info.component";
import { RepairProgressComponent } from "./components/repair-progress/repair-progress.component";
import { RepairQuoteComponent } from "./components/repair-quote/repair-quote.component";
import { RepairTimelineComponent } from "./components/repair-timeline/repair-timeline.component";

@Component({
  selector: "cu-repair-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    RepairInfoComponent,
    RepairProgressComponent,
    RepairQuoteComponent,
    RepairTimelineComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class RepairDetailComponent {
  protected readonly facade = inject(RepairsFacade);

  readonly id = input.required<string>();

  protected readonly order = this.facade.selected;

  protected readonly awaitingDecision = computed(
    () => this.order()?.status === RepairOrderStatus.QUOTE_PENDING_APPROVAL,
  );
  protected readonly showQuote = computed(
    () => !!this.order() && this.order()!.quote.status !== "DRAFT",
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  approve(): void {
    if (confirm("Kostenvoranschlag freigeben und die Reparatur beauftragen?")) {
      this.facade.approve(this.id());
    }
  }

  reject(): void {
    const reason = prompt(
      "Warum lehnst du den Kostenvoranschlag ab? (optional, wird der Werkstatt angezeigt)",
    );
    // `null` => dialog dismissed; "" => confirmed without a reason.
    if (reason === null) return;
    this.facade.reject(this.id(), reason.trim() || undefined);
  }
}
