import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from "@angular/core";
import { CardComponent } from "../../../../../shared";
import { CarCatalogFacade } from "../../../../../Store/car-catalog";

@Component({
  selector: "bo-brand-logo",
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./brand-logo.component.html",
  styleUrl: "./brand-logo.component.css",
})
export class BrandLogoComponent {
  private readonly facade = inject(CarCatalogFacade);

  readonly brandId = input.required<string>();
  readonly logoUrl = input<string | undefined>();
  readonly saving = input(false);

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.facade.uploadLogo(this.brandId(), file);
    input.value = "";
  }

  remove(): void {
    this.facade.removeLogo(this.brandId());
  }
}
