import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import type { CarModel } from "@car-garage/shared";
import { ButtonComponent, TextFieldComponent } from "../../../../../shared";
import { CarCatalogFacade } from "../../../../../Store/car-catalog";

@Component({
  selector: "bo-brand-models",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, TextFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./brand-models.component.html",
  styleUrl: "./brand-models.component.css",
})
export class BrandModelsComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly facade = inject(CarCatalogFacade);

  readonly brandId = input.required<string>();
  readonly models = input.required<CarModel[]>();
  readonly saving = input(false);

  protected readonly showForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(1)]],
  });

  add(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.facade.createModel(this.brandId(), this.form.getRawValue().name.trim());
    this.form.reset();
    this.showForm.set(false);
  }

  rename(model: CarModel): void {
    const next = prompt("Neuer Modellname", model.name)?.trim();
    if (next && next !== model.name) {
      this.facade.updateModel(this.brandId(), model.id, next);
    }
  }

  remove(model: CarModel): void {
    if (confirm(`Modell „${model.name}" wirklich löschen?`)) {
      this.facade.deleteModel(this.brandId(), model.id);
    }
  }
}
