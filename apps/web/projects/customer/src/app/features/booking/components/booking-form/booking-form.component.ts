import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import type { CarBrand, CarModel } from "@car-garage/shared";
import { ButtonComponent } from "../../../../shared";

export interface BookingFormValue {
  brandId: string;
  modelId: string;
  licensePlate?: string;
  problemDescription: string;
}

@Component({
  selector: "cu-booking-form",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./booking-form.component.html",
  styleUrl: "./booking-form.component.css",
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly brands = input.required<CarBrand[]>();
  readonly models = input.required<CarModel[]>();
  readonly modelsLoading = input(false);
  readonly submitting = input(false);
  /** True while no slot is selected — the submit button stays disabled. */
  readonly slotMissing = input(false);

  readonly brandChange = output<string>();
  readonly save = output<BookingFormValue>();

  protected readonly form = this.fb.nonNullable.group({
    brandId: ["", Validators.required],
    modelId: [{ value: "", disabled: true }, Validators.required],
    licensePlate: [""],
    problemDescription: [
      "",
      [Validators.required, Validators.minLength(5), Validators.maxLength(2000)],
    ],
  });

  constructor() {
    this.form.controls.brandId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((brandId) => {
        this.form.controls.modelId.reset("");
        this.form.controls.modelId.disable();
        this.brandChange.emit(brandId);
      });

    // Enable the model picker once its options have arrived.
    effect(() => {
      const ready = !this.modelsLoading() && this.models().length > 0;
      const control = this.form.controls.modelId;
      if (ready && control.disabled) control.enable();
      if (!ready && control.enabled) control.disable();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      brandId: v.brandId,
      modelId: v.modelId,
      licensePlate: v.licensePlate.trim() || undefined,
      problemDescription: v.problemDescription.trim(),
    });
  }
}
