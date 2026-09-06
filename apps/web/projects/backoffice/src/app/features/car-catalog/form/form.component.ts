import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  AlertComponent,
  ButtonComponent,
  TextFieldComponent,
} from "../../../shared";
import { CarCatalogFacade } from "../../../Store/car-catalog";

@Component({
  selector: "bo-brand-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AlertComponent,
    ButtonComponent,
    TextFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./form.component.html",
})
export class BrandFormComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(CarCatalogFacade);

  /** Route param `:brandId` — present in edit mode. */
  readonly brandId = input<string>();
  protected readonly isEdit = computed(() => !!this.brandId());

  protected readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
  });

  constructor() {
    effect(() => {
      const id = this.brandId();
      if (id) this.facade.loadBrand(id);
    });

    effect(() => {
      const brand = this.facade.selected();
      if (!brand || brand.id !== this.brandId()) return;
      this.form.patchValue({ name: brand.name });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const name = this.form.getRawValue().name.trim();
    const id = this.brandId();
    if (id) this.facade.updateBrand(id, name);
    else this.facade.createBrand(name);
  }
}
