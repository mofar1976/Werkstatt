import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../../shared";
import { CustomersFacade } from "../../../Store/customers";
import type { CustomerInput } from "../../../Store/customers";
import { CustomerInfoComponent } from "./components/customer-info/customer-info.component";
import { CustomerEditComponent } from "./components/customer-edit/customer-edit.component";

@Component({
  selector: "bo-customer-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    CustomerInfoComponent,
    CustomerEditComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class CustomerDetailComponent {
  protected readonly facade = inject(CustomersFacade);

  readonly id = input.required<string>();

  protected readonly customer = this.facade.selected;
  protected readonly editing = signal(false);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.facade.loadDetail(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveDetail());
  }

  save(input: CustomerInput): void {
    this.facade.update(this.id(), input);
    // Close optimistically; a failed save surfaces via the error alert above.
    this.editing.set(false);
  }

  toggleBlocked(): void {
    const blocked = this.customer()?.isActive ?? false;
    this.facade.setBlocked(this.id(), blocked);
  }

  remove(): void {
    if (
      confirm(
        "Nutzerkonto wirklich löschen? Der Zugang wird deaktiviert, bestehende Termine bleiben erhalten.",
      )
    ) {
      this.facade.remove(this.id());
    }
  }
}
