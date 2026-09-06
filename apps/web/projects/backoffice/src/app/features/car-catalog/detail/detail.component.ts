import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  AlertComponent,
  ButtonComponent,
  SpinnerComponent,
} from "../../../shared";
import { CarCatalogFacade } from "../../../Store/car-catalog";
import { BrandLogoComponent } from "./components/brand-logo/brand-logo.component";
import { BrandModelsComponent } from "./components/brand-models/brand-models.component";

@Component({
  selector: "bo-brand-detail",
  standalone: true,
  imports: [
    RouterLink,
    AlertComponent,
    ButtonComponent,
    SpinnerComponent,
    BrandLogoComponent,
    BrandModelsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./detail.component.html",
})
export class BrandDetailComponent {
  protected readonly facade = inject(CarCatalogFacade);

  readonly brandId = input.required<string>();

  protected readonly brand = this.facade.selected;

  constructor() {
    effect(() => {
      const id = this.brandId();
      if (id) this.facade.loadBrand(id);
    });
    inject(DestroyRef).onDestroy(() => this.facade.leaveBrand());
  }

  remove(): void {
    if (
      confirm(
        "Marke wirklich löschen? Alle zugehörigen Modelle werden ebenfalls entfernt.",
      )
    ) {
      this.facade.deleteBrand(this.brandId());
    }
  }
}
